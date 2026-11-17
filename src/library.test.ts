import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { CliError, isCliError } from "@wirecat/cli-base"
import { linkFetch } from "@wirecat/cli-core/cli"
import { type FeedlessDocumentSource, syncDocuments } from "@wirecat/cli-core/documents"
import { documentProfile } from "@wirecat/cli-core/documents/cli"
import { documentCommandsContract, documentSourceContract } from "@wirecat/cli-core/documents/testing"
import { describe, expect, it } from "vitest"
import { libraryCommands } from "./commands/library.js"
import { IDENTITY } from "./identity.js"
import { createProgram } from "./program.js"
import { FAKE_TOKEN, type FakeDisk, fakeDisk } from "./testing/fake-disk.js"
import { runCli } from "./testing/harness.js"
import { type DiskFile, diskSource, isFolder, skipReason } from "./yandex/source.js"
import { transport } from "./yandex/transport.js"

const LINKS = ["downloader.disk.yandex.ru"]

const tree = () => {
  const disk = fakeDisk()
  disk.put("disk:/Work")
  disk.put("disk:/Work/plan.txt", "quarterly budget for the test team")
  disk.put("disk:/Work/Notes/review.md", "# Review\n\nnotes from the planning review")
  disk.put("disk:/Work/photo.jpg", "not text", "image/jpeg")
  disk.put("disk:/Other/elsewhere.txt", "outside the chosen folder")
  return disk
}

const sourceOver = (disk: FakeDisk) =>
  diskSource(transport({ token: FAKE_TOKEN, fetch: disk.fetch }), linkFetch({ hosts: LINKS, fetch: disk.fetch }))

/** Each test gets its own folders, so one test's sync never reads another's. */
const sandbox = () => {
  const dir = mkdtempSync(join(tmpdir(), "ydisk-library-"))
  return {
    YDISK_STATE_DIR: join(dir, "state"),
    YDISK_CONFIG_DIR: join(dir, "config"),
    YDISK_CACHE_DIR: join(dir, "cache"),
    MESSAGING_STORE: join(dir, "wirecat.db"),
  }
}

describe("the Yandex Disk source", () => {
  for (const c of documentSourceContract<DiskFile>(async () => {
    const disk = tree()
    const raw = sourceOver(disk)
    const top = await raw.byPath("disk:/Work")
    // The CLI reads a chosen folder's path from its settings; the fixture does the same.
    const source: FeedlessDocumentSource<DiskFile> = {
      ...raw,
      metadata: (id: string, known?: DiskFile) => raw.metadata(id, known ?? (id === top.id ? top : undefined)),
    }
    const state = documentProfile<DiskFile>(IDENTITY, sandbox(), "personal").state("1000")
    const saved = new Set<string>()
    return {
      source,
      root: top.id,
      isFolder,
      missing: "fake-unknown",
      change: async () => {
        disk.put("disk:/Work/new.txt", "a new budget file")
      },
      remove: async () => {
        const id = disk.nodes.get("disk:/Work/plan.txt")?.resource_id as string
        disk.remove("disk:/Work/plan.txt")
        return id
      },
      faults: {
        deny: (status) => {
          disk.deny("disk:/Work/plan.txt", status)
          return disk.nodes.get("disk:/Work/plan.txt")?.resource_id as string
        },
        sync: async ({ wrap, budget, deadline, signal, now }) => {
          const result = await syncDocuments<DiskFile>({
            source: wrap(source),
            index: {
              save: async (_principal, content) => {
                saved.add(content.metadata.id)
                return `document:${saved.size}`
              },
              remove: async (_principal, id) => {
                saved.delete(id)
              },
              openPictures: async () => {
                throw new CliError("not_found", "no pictures")
              },
            },
            state,
            principal: "1000",
            roots: [top.id],
            textLimit: 100_000,
            max: 1_000,
            maxEntries: 1_000,
            isFolder,
            skipReason,
            retryable: () => false,
            errorOf: (error) => (isCliError(error) ? error : new CliError("provider_error", String(error))),
            assertHeld: () => undefined,
            storeVersion: "test",
            ...(budget ? { budget } : {}),
            ...(deadline ? { deadline } : {}),
            ...(signal ? { signal } : {}),
            ...(now ? { now } : {}),
          })
          return { result, saved: [...saved] }
        },
      },
    }
  }))
    it(c.name, c.run)

  it("never sends the token to the download host and asks the API only what the fake knows", async () => {
    const disk = tree()
    const answer = await runCli(["personal", "folders", "add", "/Work", "--json"], { service: disk, env: sandbox() })
    expect(answer.code, answer.err).toBe(0)
    const env = { ...sandbox() }
    await runCli(["personal", "folders", "add", "disk:/Work", "--json"], { service: disk, env })
    const synced = await runCli(["personal", "sync", "--json"], { service: disk, env })
    expect(synced.code, synced.err).toBe(0)
    expect(disk.refusals).toEqual([])
    const downloads = disk.calls.filter((call) => call.url.host === "downloader.disk.yandex.ru")
    expect(downloads.length).toBeGreaterThan(0)
    expect(downloads.every((call) => !call.auth)).toBe(true)
  })

  it("keeps a moved file's id, so its tags stay, and drops a file deleted on the Disk", async () => {
    const disk = tree()
    const env = sandbox()
    const run = (...argv: string[]) => runCli(["personal", ...argv, "--json"], { service: disk, env })
    await run("folders", "add", "/Work")
    expect((await run("sync")).json().item).toMatchObject({ saved: 2 })
    const id = disk.nodes.get("disk:/Work/plan.txt")?.resource_id as string
    expect((await run("tags", "add", id, "budget")).code).toBe(0)
    disk.move("disk:/Work/plan.txt", "disk:/Work/Notes/plan.txt")
    disk.remove("disk:/Work/Notes/review.md")
    expect((await run("sync")).json().item).toMatchObject({ removed: 1 })
    const shown = (await run("documents", "show", id)).json()
    expect(JSON.stringify(shown)).toContain("disk:/Work/Notes/plan.txt")
    expect(((await run("tags", "list", id)).json().items as { tag: string }[]).map((tag) => tag.tag)).toEqual([
      "budget",
    ])
  })
})

describe("a chosen folder renamed on the Disk", () => {
  it("is unavailable and its copies leave, until it is added again under its new path", async () => {
    const disk = tree()
    const env = sandbox()
    const run = (...argv: string[]) => runCli(["personal", ...argv, "--json"], { service: disk, env })
    await run("folders", "add", "/Work")
    expect((await run("sync")).json().item).toMatchObject({ saved: 2 })
    disk.move("disk:/Work", "disk:/Renamed")
    expect((await run("sync")).json().item).toMatchObject({ removed: 3 })
    expect((await run("folders", "add", "/Renamed")).code).toBe(0)
    expect((await run("sync")).json().item).toMatchObject({ saved: 2 })
  })
})

describe("the shared documents commands over Yandex Disk", () => {
  for (const c of documentCommandsContract(async () => {
    const disk = tree()
    const env = sandbox()
    const run = async (argv: string[]) => {
      const answer = await runCli(["personal", ...argv, "--json"], { service: disk, env })
      return { exit: answer.code, stdout: answer.out }
    }
    await run(["folders", "add", "/Work"])
    return {
      program: createProgram(),
      words: { app: "ydisk", remote: "disk", provider: "Yandex Disk", source: "yandex-disk" },
      run,
      document: disk.nodes.get("disk:/Work/plan.txt")?.resource_id as string,
      word: "quarterly",
    }
  }))
    it(c.name, c.run)

  it("mounts the shared groups once", () => {
    expect(libraryCommands().map((command) => command.name())).toContain("folders")
  })
})
