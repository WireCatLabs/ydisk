import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { linkFetch } from "@wirecat/cli-core/cli"
import { expect, it } from "vitest"
import { LINK_HOSTS } from "../context.js"
import { FAKE_TOKEN, fakeDisk } from "../testing/fake-disk.js"
import { diskTarget } from "./mirror-target.js"
import { transport } from "./transport.js"

const over = () => {
  const disk = fakeDisk()
  const target = diskTarget(
    transport({ token: FAKE_TOKEN, fetch: disk.fetch }),
    linkFetch({ hosts: LINK_HOSTS, fetch: disk.fetch }),
  )
  const local = (text: string) => {
    const path = join(mkdtempSync(join(tmpdir(), "ydisk-target-")), "file.txt")
    writeFileSync(path, text)
    return path
  }
  return { disk, target, local }
}

it("lists a folder tree with paths relative to its root, hashes and the root's id", async () => {
  const { disk, target } = over()
  const rootId = disk.put("disk:/Notes")
  disk.put("disk:/Notes/a.txt", "a")
  disk.put("disk:/Notes/Sub/b.txt", "b")
  const listed = await target.list("disk:/Notes")
  expect(listed).toMatchObject({ rootId, complete: true })
  expect(listed?.files.map((file) => file.path).sort()).toEqual(["Sub/b.txt", "a.txt"])
  expect(listed?.files.find((file) => file.path === "a.txt")).toMatchObject({
    size: 1,
    sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    md5: "0cc175b9c0f1b6a831c399e269772661",
  })
  expect(await target.list("disk:/Missing")).toBeUndefined()
  const top = await target.list("disk:/")
  expect(top?.files.map((file) => file.path).sort()).toEqual(["Notes/Sub/b.txt", "Notes/a.txt"])
})

it("pages a large folder, and a folder it cannot read leaves the listing incomplete", async () => {
  const { disk, target } = over()
  for (let n = 0; n < 205; n++) disk.put(`disk:/Big/f${String(n).padStart(3, "0")}.txt`, String(n))
  disk.put("disk:/Big/Locked/x.txt", "x")
  expect((await target.list("disk:/Big"))?.files).toHaveLength(206)
  disk.deny("disk:/Big/Locked", 403)
  expect(await target.list("disk:/Big")).toMatchObject({ complete: false })
})

it("refuses to list a file as a mirror's root", async () => {
  const { disk, target } = over()
  disk.put("disk:/a.txt", "a")
  await expect(target.list("disk:/a.txt")).rejects.toMatchObject({ code: "validation_error" })
})

it("uploads a new file only where none is, and replaces one only while it has the listed hash", async () => {
  const { disk, target, local } = over()
  disk.put("disk:/Notes")
  const sent = await target.upload("disk:/Notes/a.txt", local("one"), { absent: true })
  expect(disk.nodes.get("disk:/Notes/a.txt")?.text).toBe("one")
  expect(sent).toMatchObject({ path: "a.txt", size: 3, sha256: disk.nodes.get("disk:/Notes/a.txt")?.sha256 })
  await expect(target.upload("disk:/Notes/a.txt", local("two"), { absent: true })).rejects.toMatchObject({
    code: "conflict",
  })
  const listed = { sha256: sent.sha256 as string }
  disk.put("disk:/Notes/a.txt", "changed elsewhere")
  await expect(target.upload("disk:/Notes/a.txt", local("two"), listed)).rejects.toMatchObject({ code: "conflict" })
  disk.put("disk:/Notes/a.txt", "one")
  const replaced = await target.upload("disk:/Notes/a.txt", local("two"), listed)
  expect(replaced.id).toBe(sent.id)
  expect(disk.nodes.get("disk:/Notes/a.txt")?.text).toBe("two")
  await expect(target.upload("disk:/Notes/gone.txt", local("x"), listed)).rejects.toMatchObject({ code: "conflict" })
})

it("trashes a file with the expected md5, and finds the md5 itself when only the sha256 is known", async () => {
  const { disk, target } = over()
  disk.put("disk:/a.txt", "a")
  disk.put("disk:/b.txt", "b")
  const a = disk.nodes.get("disk:/a.txt")
  await expect(target.trash("disk:/a.txt", { sha256: "x", md5: "wrong" })).rejects.toMatchObject({ code: "conflict" })
  await target.trash("disk:/a.txt", { sha256: a?.sha256 as string, md5: a?.md5 as string })
  expect(disk.trash.has("disk:/a.txt")).toBe(true)
  await expect(target.trash("disk:/b.txt", { sha256: "other" })).rejects.toMatchObject({ code: "conflict" })
  await target.trash("disk:/b.txt", { sha256: disk.nodes.get("disk:/b.txt")?.sha256 as string })
  expect(disk.trash.has("disk:/b.txt")).toBe(true)
})

it("creates a folder with its missing parents, and accepts one that exists", async () => {
  const { disk, target } = over()
  await target.ensureFolder("disk:/One/Two/Three")
  expect(disk.nodes.get("disk:/One/Two/Three")?.type).toBe("dir")
  await target.ensureFolder("disk:/One/Two")
  disk.put("disk:/file.txt", "f")
  await expect(target.ensureFolder("disk:/file.txt")).rejects.toMatchObject({ code: "conflict" })
})

it("downloads a file into a new local file, and reads the account and the Disk's revision", async () => {
  const { disk, target } = over()
  disk.put("disk:/a.txt", "content")
  const into = join(mkdtempSync(join(tmpdir(), "ydisk-target-")), "a.txt")
  await target.download("disk:/a.txt", into)
  expect(readFileSync(into, "utf8")).toBe("content")
  await expect(target.download("disk:/a.txt", into)).rejects.toMatchObject({ code: "EEXIST" })
  expect(await target.identity()).toBe("1000")
  const before = await target.revision?.()
  disk.put("disk:/b.txt", "b")
  expect(await target.revision?.()).not.toBe(before)
})

it("walks the listing again when the Disk changes under it, and calls it incomplete when it never holds still", async () => {
  const { disk, target } = over()
  for (let n = 0; n < 205; n++) disk.put(`disk:/Big/f${String(n).padStart(3, "0")}.txt`, String(n))
  disk.put("disk:/Big/Later/x.txt", "x")
  let once = true
  disk.beforePage = (path, offset) => {
    if (path !== "disk:/Big" || offset !== 200 || !once) return
    once = false
    // Page two shifts by one: without a second walk f200 would be missing from a listing called complete.
    disk.remove("disk:/Big/f000.txt")
    disk.move("disk:/Big/Later/x.txt", "disk:/Big/aaa.txt")
  }
  const listed = await target.list("disk:/Big")
  expect(listed?.complete).toBe(true)
  const paths = listed?.files.map((file) => file.path) ?? []
  expect(paths).toHaveLength(205)
  expect(paths).toEqual(expect.arrayContaining(["f200.txt", "f204.txt", "aaa.txt"]))
  expect(paths).not.toContain("f000.txt")
  let n = 0
  disk.beforePage = (path, offset) => {
    if (path === "disk:/Big" && offset === 200) disk.put(`disk:/Elsewhere/${n++}.txt`, "busy")
  }
  expect(await target.list("disk:/Big")).toMatchObject({ complete: false })
  expect(n).toBe(3)
})

it("refuses to replace or trash a file when no hash can show it is the one listed", async () => {
  const { disk, target, local } = over()
  disk.put("disk:/a.txt", "a")
  const listed = { sha256: disk.nodes.get("disk:/a.txt")?.sha256 as string }
  const node = disk.nodes.get("disk:/a.txt")
  disk.nodes.set("disk:/a.txt", { ...node, sha256: undefined, md5: undefined } as NonNullable<typeof node>)
  await expect(target.upload("disk:/a.txt", local("b"), listed)).rejects.toMatchObject({ code: "conflict" })
  await expect(target.trash("disk:/a.txt", listed)).rejects.toMatchObject({ code: "conflict" })
  expect(disk.nodes.get("disk:/a.txt")?.text).toBe("a")
  expect(disk.trash.size).toBe(0)
  expect(disk.calls.filter((call) => call.method === "DELETE")).toEqual([])
})

it("waits for an upload the Disk answered 202 to land before it reads the file back", async () => {
  const { disk, target, local } = over()
  disk.put("disk:/Notes")
  disk.acceptUploads = 2
  const sent = await target.upload("disk:/Notes/a.txt", local("late"), { absent: true })
  expect(sent).toMatchObject({ path: "a.txt", sha256: disk.nodes.get("disk:/Notes/a.txt")?.sha256 })
  expect(disk.calls.filter((call) => call.url.pathname.startsWith("/v1/disk/operations/"))).toHaveLength(3)
})
