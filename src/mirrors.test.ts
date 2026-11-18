import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, it } from "vitest"
import { type FakeDisk, fakeDisk } from "./testing/fake-disk.js"
import { runCli } from "./testing/harness.js"

/** A Disk folder and a local folder for one test, with its own state and config, so no test sees another's mirror. */
const setup = (files: Record<string, string> = {}, local: Record<string, string> = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "ydisk-mirror-"))
  const root = join(dir, "notes")
  mkdirSync(root)
  for (const [path, text] of Object.entries(local)) write(root, path, text)
  const disk = fakeDisk()
  disk.put("disk:/Notes")
  for (const [path, text] of Object.entries(files)) disk.put(`disk:/Notes/${path}`, text)
  const env = { YDISK_STATE_DIR: join(dir, "state"), YDISK_CONFIG_DIR: join(dir, "config") }
  const cli = (args: string[], options: { env?: object } = {}) =>
    runCli(["personal", "mirrors", ...args, "--json"], { service: disk, env: { ...env, ...options.env } })
  const permit = (permissions: Record<string, string>) => {
    mkdirSync(env.YDISK_CONFIG_DIR, { recursive: true })
    writeFileSync(
      join(env.YDISK_CONFIG_DIR, "config.json"),
      JSON.stringify({ profiles: { personal: { permissions } } }),
    )
  }
  return { dir, root, disk, env, cli, permit }
}

const write = (root: string, path: string, text: string) => {
  mkdirSync(join(root, path, ".."), { recursive: true })
  writeFileSync(join(root, path), text)
}
const read = (root: string, path: string) => readFileSync(join(root, path), "utf8")
const text = (disk: FakeDisk, path: string) => disk.nodes.get(`disk:/Notes/${path}`)?.text

type Synced = {
  uploaded: string[]
  downloaded: string[]
  adopted: string[]
  trashed: { path: string; side: string }[]
  renamed: { from: string; to: string }[]
  conflicts: { path: string; reason: string }[]
  unknown: { path: string; side: string }[]
  errors: { path: string; code: string }[]
  plan?: { kind: string; path: string }[]
}

const added = async (cli: ReturnType<typeof setup>["cli"], root: string) => {
  const ran = await cli(["add", "/Notes", root])
  expect(ran.code, ran.err).toBe(0)
  return (ran.json().item as { id: string }).id
}
/** With --yes: files.delete asks by default, and every replace or deletion checks it. */
const synced = async (cli: ReturnType<typeof setup>["cli"], ...args: string[]) => {
  const ran = await cli(["sync", ...args, "--yes"])
  const items = (ran.json().items ?? []) as Synced[]
  return { code: ran.code, err: ran.err, json: ran.json, result: items[0] as Synced }
}
const localTrash = (root: string) => {
  const trash = join(root, ".wirecat-trash")
  return existsSync(trash) ? readdirSync(trash, { recursive: true, encoding: "utf8" }) : []
}

it("adds a mirror for a Disk folder, and refuses a local path that is not a folder", async () => {
  const { cli, root, dir } = setup()
  const ran = await cli(["add", "/Notes", root])
  expect(ran.json().item).toMatchObject({ path: root, folder: "disk:/Notes", added: true })
  const again = await cli(["add", "disk:/Notes", root])
  expect(again.json().item).toMatchObject({ added: false })
  expect((await cli(["list"])).json().items).toEqual([{ id: expect.any(String), path: root, folder: "disk:/Notes" }])
  writeFileSync(join(dir, "file.txt"), "x")
  const refused = await cli(["add", "/Notes", join(dir, "file.txt")])
  expect(refused.json()).toMatchObject({ error: { code: "validation_error", reason: "mirror.not-folder" } })
})

it("a first sync adopts identical files, copies one-sided ones both ways, and reports different ones", async () => {
  const { cli, root, disk } = setup(
    { "same.txt": "same", "disk-only.txt": "from the disk", "both.txt": "disk version" },
    { "same.txt": "same", "sub/local-only.txt": "from here", "both.txt": "local version" },
  )
  const id = await added(cli, root)
  const first = await synced(cli, id)
  expect(first.code).not.toBe(0)
  expect(first.result).toMatchObject({
    adopted: ["same.txt"],
    uploaded: ["sub/local-only.txt"],
    downloaded: ["disk-only.txt"],
    conflicts: [{ path: "both.txt", reason: expect.stringContaining("both sides") }],
  })
  expect(first.json()).toMatchObject({ meta: { complete: false, issues: [{ reason: "mirror.partial" }] } })
  expect(text(disk, "sub/local-only.txt")).toBe("from here")
  expect(read(root, "disk-only.txt")).toBe("from the disk")
  expect(read(root, "both.txt")).toBe("local version")
  expect(text(disk, "both.txt")).toBe("disk version")

  const preview = await cli(["preview", id, "--keep", "disk"])
  expect((preview.json().items as Synced[])[0]?.plan).toEqual([{ kind: "download", path: "both.txt" }])
  const kept = await synced(cli, id, "--keep", "disk")
  expect(kept.code, kept.err).toBe(0)
  expect(read(root, "both.txt")).toBe("disk version")
  expect(disk.refusals).toEqual([])
})

it("copies edits both ways, and settles a conflict with --keep both", async () => {
  const { cli, root, disk } = setup({ "a.txt": "a1", "b.txt": "b1", "c.txt": "c1" })
  const id = await added(cli, root)
  expect((await synced(cli, id)).code).toBe(0)
  write(root, "a.txt", "a2 here")
  disk.put("disk:/Notes/b.txt", "b2 on the disk")
  write(root, "c.txt", "c2 here")
  disk.put("disk:/Notes/c.txt", "c2 on the disk")
  const second = await synced(cli, id)
  expect(second.result).toMatchObject({ uploaded: ["a.txt"], downloaded: ["b.txt"], conflicts: [{ path: "c.txt" }] })
  expect(text(disk, "a.txt")).toBe("a2 here")
  expect(read(root, "b.txt")).toBe("b2 on the disk")

  const both = await synced(cli, id, "--keep", "both")
  expect(both.code, both.err).toBe(0)
  const copy = readdirSync(root).find((name) => name.startsWith("c (conflict "))
  expect(copy).toMatch(/^c \(conflict \d{4}-\d{2}-\d{2} disk\)\.txt$/u)
  expect(read(root, "c.txt")).toBe("c2 here")
  expect(read(root, copy as string)).toBe("c2 on the disk")
  expect(text(disk, copy as string)).toBe("c2 on the disk")
  expect(text(disk, "c.txt")).toBe("c2 here")
})

it("a deletion on either side goes to the other side's trash, never away", async () => {
  const { cli, root, disk } = setup({ "keep.txt": "k", "gone-here.txt": "g1", "gone-there.txt": "g2" })
  const id = await added(cli, root)
  await synced(cli, id)
  rmSync(join(root, "gone-here.txt"))
  disk.remove("disk:/Notes/gone-there.txt")
  const ran = await synced(cli, id)
  expect(ran.code, ran.err).toBe(0)
  expect(ran.result.trashed).toEqual([
    { path: "gone-here.txt", side: "remote" },
    { path: "gone-there.txt", side: "local" },
  ])
  expect(disk.trash.get("disk:/Notes/gone-here.txt")?.text).toBe("g1")
  expect(existsSync(join(root, "gone-there.txt"))).toBe(false)
  expect(localTrash(root).some((path) => path.endsWith("gone-there.txt"))).toBe(true)
  expect(text(disk, "keep.txt")).toBe("k")
})

it("a file missing from an incomplete listing, or a missing Disk folder, is not taken as deleted", async () => {
  const { cli, root, disk } = setup({ "top.txt": "t", "Locked/inside.txt": "i" })
  const id = await added(cli, root)
  await synced(cli, id)
  disk.deny("disk:/Notes/Locked", 403)
  const partial = await synced(cli, id)
  expect(partial.code).not.toBe(0)
  expect(partial.result.unknown).toEqual([{ path: "Locked/inside.txt", side: "remote", reason: expect.any(String) }])
  expect(read(root, "Locked/inside.txt")).toBe("i")
  expect(localTrash(root)).toEqual([])

  disk.remove("disk:/Notes")
  const gone = await synced(cli, id)
  expect(gone.code).not.toBe(0)
  expect(gone.result.errors).toEqual([{ path: ".", code: "not_found", message: expect.any(String) }])
  expect(read(root, "top.txt")).toBe("t")
  expect(localTrash(root)).toEqual([])
})

it("a file moved on the Disk is renamed here by its resource_id", async () => {
  const { cli, root, disk } = setup({ "old.txt": "moving" })
  const id = await added(cli, root)
  await synced(cli, id)
  disk.put("disk:/Notes/Archive")
  disk.move("disk:/Notes/old.txt", "disk:/Notes/Archive/new.txt")
  const ran = await synced(cli, id)
  expect(ran.code, ran.err).toBe(0)
  expect(ran.result.renamed).toEqual([{ from: "old.txt", to: "Archive/new.txt" }])
  expect(read(root, "Archive/new.txt")).toBe("moving")
  expect(existsSync(join(root, "old.txt"))).toBe(false)
  expect(localTrash(root)).toEqual([])
})

it("a Disk file changed between the listing and its deletion stays: the md5 check refuses the delete", async () => {
  const { cli, root, disk } = setup({ "race.txt": "first", "stays.txt": "s" })
  const id = await added(cli, root)
  await synced(cli, id)
  rmSync(join(root, "race.txt"))
  disk.beforeWrite = (method, path) => {
    if (method === "DELETE" && path === "disk:/Notes/race.txt") disk.put(path, "edited elsewhere")
  }
  const ran = await synced(cli, id)
  expect(ran.code).not.toBe(0)
  expect(ran.result.conflicts).toEqual([expect.objectContaining({ path: "race.txt" })])
  expect(text(disk, "race.txt")).toBe("edited elsewhere")
  expect(disk.trash.size).toBe(0)
})

it("keeps the local versions a sync replaced, and restores one for the next sync to send", async () => {
  const { cli, root, disk } = setup({ "plan.md": "v1" })
  const id = await added(cli, root)
  await synced(cli, id)
  disk.put("disk:/Notes/plan.md", "v2 from the disk")
  await synced(cli, id)
  expect(read(root, "plan.md")).toBe("v2 from the disk")
  const listed = await cli(["versions", "list", id, "plan.md"])
  const events = listed.json().items as { event: string; old?: string; available: boolean }[]
  const replaced = events.find((event) => event.event === "changed")
  expect(replaced).toMatchObject({ direction: "remote-to-local", available: true })
  const restored = await cli(["versions", "restore", id, join(root, "plan.md"), replaced?.old as string])
  expect(restored.json().item).toMatchObject({ path: "plan.md", restored: true })
  expect(read(root, "plan.md")).toBe("v1")
  const sent = await synced(cli, id)
  expect(sent.result.uploaded).toEqual(["plan.md"])
  expect(text(disk, "plan.md")).toBe("v1")
  const missing = await cli(["versions", "restore", id, "plan.md", "0".repeat(64)])
  expect(missing.json()).toMatchObject({ error: { code: "not_found" } })
})

it("a Disk folder replaced by another is refused until --repin, which then deletes nothing", async () => {
  const { cli, root, disk } = setup({ "a.txt": "a", "b.txt": "b" })
  const id = await added(cli, root)
  await synced(cli, id)
  disk.remove("disk:/Notes")
  disk.put("disk:/Notes")
  disk.put("disk:/Notes/a.txt", "a")
  const refused = await synced(cli, id)
  expect(refused.code).not.toBe(0)
  expect(refused.result.errors).toEqual([
    { path: ".", code: "confirmation_required", message: expect.stringContaining("--repin") },
  ])
  const repinned = await synced(cli, id, "--repin")
  expect(repinned.code, repinned.err).toBe(0)
  expect(repinned.result).toMatchObject({ adopted: ["a.txt"], uploaded: ["b.txt"], trashed: [] })
  expect(text(disk, "b.txt")).toBe("b")
})

it("preview lists the Disk and shows the plan; sync --dry-run shows the keys; neither writes", async () => {
  const { cli, root, disk } = setup({ "there.txt": "t" }, { "here.txt": "h" })
  const id = await added(cli, root)
  const before = disk.revision()
  const preview = await cli(["preview", id])
  expect(preview.code, preview.err).toBe(0)
  expect((preview.json().items as Synced[])[0]?.plan).toEqual([
    { kind: "upload", path: "here.txt" },
    { kind: "download", path: "there.txt" },
  ])
  const calls = disk.calls.length
  const dry = await cli(["sync", id, "--dry-run"])
  expect(dry.code, dry.err).toBe(0)
  expect(dry.json().item).toMatchObject({ permission: { key: "mirrors.sync" } })
  expect(JSON.stringify(dry.json())).toContain("files.delete")
  expect(disk.calls.length).toBe(calls)
  expect(disk.revision()).toBe(before)
  expect(existsSync(join(root, "there.txt"))).toBe(false)
  expect(disk.calls.filter((call) => call.method !== "GET")).toEqual([])
})

it("files.delete at deny lets a sync add files and stops only what replaces or deletes", async () => {
  const { cli, root, disk, permit } = setup({ "a.txt": "a1", "gone.txt": "g" })
  const id = await added(cli, root)
  await synced(cli, id)
  permit({ "files.delete": "deny" })
  write(root, "new.txt", "new")
  write(root, "a.txt", "a2")
  rmSync(join(root, "gone.txt"))
  const ran = await synced(cli, id)
  expect(ran.code).not.toBe(0)
  expect(ran.result.uploaded).toEqual(["new.txt"])
  expect(ran.result.errors.map((error) => [error.path, error.code])).toEqual([
    ["a.txt", "permission_error"],
    ["gone.txt", "permission_error"],
  ])
  expect(text(disk, "a.txt")).toBe("a1")
  expect(text(disk, "gone.txt")).toBe("g")
})

it("a sync asks once for each key at ask, however many files it replaces or deletes", async () => {
  const { cli, root, disk, env } = setup({ "a.txt": "a1", "b.txt": "b1", "gone.txt": "g" })
  const id = await added(cli, root)
  await synced(cli, id)
  write(root, "a.txt", "a2")
  disk.put("disk:/Notes/b.txt", "b2")
  rmSync(join(root, "gone.txt"))
  const unasked = await cli(["sync", id])
  expect(unasked.json().items).toEqual([
    expect.objectContaining({
      errors: [
        expect.objectContaining({ path: "a.txt", code: "confirmation_required" }),
        expect.objectContaining({ path: "b.txt", code: "confirmation_required" }),
        expect.objectContaining({ path: "gone.txt", code: "confirmation_required" }),
      ],
    }),
  ])
  const asked: string[] = []
  // cli-core never asks under --json.
  const yes = await runCli(["personal", "mirrors", "sync", id], {
    service: disk,
    env,
    answer: (question) => {
      asked.push(question)
      return "y"
    },
  })
  expect(yes.code, yes.err).toBe(0)
  expect(asked).toHaveLength(1)
  expect(text(disk, "a.txt")).toBe("a2")
  expect(read(root, "b.txt")).toBe("b2")
  expect(disk.trash.has("disk:/Notes/gone.txt")).toBe(true)
})

it("the read-only switch refuses a sync before any write, and preview still runs", async () => {
  const { cli, root, disk } = setup({}, { "here.txt": "h" })
  const id = await added(cli, root)
  const locked = { env: { YDISK_READ_ONLY: "1" } }
  const refused = await cli(["sync", id, "--yes"], locked)
  expect(refused.code).not.toBe(0)
  expect(disk.calls.filter((call) => call.method !== "GET")).toEqual([])
  const preview = await cli(["preview", id], locked)
  expect(preview.code, preview.err).toBe(0)
})

it("a sync signed in to another account is refused", async () => {
  const { cli, root, env } = setup({ "a.txt": "a" })
  const id = await added(cli, root)
  const list = join(env.YDISK_STATE_DIR, "profiles", "personal", "mirrors.json")
  writeFileSync(list, readFileSync(list, "utf8").replace('"account": "1000"', '"account": "2000"'))
  const ran = await synced(cli, id)
  expect(ran.json()).toMatchObject({ error: { code: "authentication_error", reason: "profile.wrong-account" } })
})

it("status shows local changes without asking the Disk, and remove forgets the pair only", async () => {
  const { cli, root, disk } = setup({ "a.txt": "a" })
  const id = await added(cli, root)
  await synced(cli, id)
  write(root, "b.txt", "b")
  const calls = disk.calls.length
  const status = await cli(["status", id])
  expect(status.json().items).toEqual([
    expect.objectContaining({ id, upload: 1, delete: 0, unchanged: 1, remote_checked: false }),
  ])
  expect(disk.calls.length).toBe(calls)
  const removed = await cli(["remove", id])
  expect(removed.json().item).toEqual({ id, removed: true })
  expect((await cli(["list"])).json().items).toEqual([])
  expect(read(root, "a.txt")).toBe("a")
  expect(text(disk, "a.txt")).toBe("a")
  const gone = await cli(["sync", id])
  expect(gone.json()).toMatchObject({ error: { code: "not_found", reason: "mirror.not-found" } })
})

it("watch syncs at start and ends at --timeout with exit 0", async () => {
  const { root, disk, env } = setup({ "there.txt": "t" }, { "deep/here.txt": "h" })
  const cli = (args: string[]) => runCli(["personal", "mirrors", ...args], { service: disk, env })
  const add = await cli(["add", "/Notes", root, "--json"])
  const mirror = (add.json().item as { id: string }).id
  const ran = await cli(["watch", mirror, "--every", "10s", "--timeout", "1s", "--jsonl"])
  expect(ran.code, ran.err).toBe(0)
  const records = ran.out
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as { type: string; data?: unknown })
  expect(records[0]).toMatchObject({
    type: "item",
    data: { triggers: ["start"], results: [{ uploaded: ["deep/here.txt"], downloaded: ["there.txt"] }] },
  })
  expect(text(disk, "deep/here.txt")).toBe("h")
  expect(records.at(-1)).toMatchObject({ type: "end" })
})

it("stops a run that would delete many files until --allow-deletions covers them", async () => {
  const files = Object.fromEntries(Array.from({ length: 8 }, (_, n) => [`f${n}.txt`, String(n)]))
  const { cli, root, disk } = setup(files)
  const id = await added(cli, root)
  await synced(cli, id)
  for (let n = 0; n < 4; n++) rmSync(join(root, `f${n}.txt`))
  const stopped = await synced(cli, id)
  expect(stopped.json()).toMatchObject({
    error: { code: "confirmation_required", reason: "mirror.too-many-deletions" },
  })
  expect(disk.trash.size).toBe(0)
  const invalid = await synced(cli, id, "--allow-deletions", "some")
  expect(invalid.json()).toMatchObject({ error: { code: "validation_error" } })
  const allowed = await synced(cli, id, "--allow-deletions", "4")
  expect(allowed.code, allowed.err).toBe(0)
  expect(disk.trash.size).toBe(4)
})

it("add refuses a Disk path that is a file, and an unreadable mirror list is refused, not reset", async () => {
  const { cli, root, disk, env } = setup({ "a.txt": "a" })
  const file = await cli(["add", "/Notes/a.txt", root])
  expect(file.json()).toMatchObject({ error: { code: "validation_error", reason: "mirror.not-folder" } })
  await added(cli, root)
  const list = join(env.YDISK_STATE_DIR, "profiles", "personal", "mirrors.json")
  writeFileSync(list, "{ not json")
  expect((await cli(["list"])).json()).toMatchObject({ error: { code: "configuration_error" } })
  writeFileSync(list, JSON.stringify([{ id: "x" }]))
  expect((await cli(["list"])).json()).toMatchObject({ error: { code: "configuration_error" } })
  expect(disk.refusals).toEqual([])
})

it("watch refuses to ask the Disk more often than every 10 seconds", async () => {
  const { cli, root } = setup()
  const id = await added(cli, root)
  const fast = await cli(["watch", id, "--every", "1s"])
  expect(fast.json()).toMatchObject({ error: { code: "validation_error" } })
})
