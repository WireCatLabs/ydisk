import { describe, expect, it } from "vitest"
import { diskMount, MOST_SHOWN } from "./mount.js"
import { PAGE } from "./source.js"
import type { Request, Transport } from "./transport.js"

const file = (path: string) => ({
  path,
  name: path.split("/").at(-1) ?? "",
  type: "file" as const,
  resource_id: `fake-${path}`,
  modified: "2026-01-02T00:00:00+00:00",
  size: 10,
  mime_type: "text/plain",
  md5: "fakemd5",
})

const setup = (links: (href: string, headers: Headers) => Response, folderSize = 2) => {
  const sent: Request[] = []
  let issued = 0
  const api: Transport = {
    send: async (request) => {
      sent.push(request)
      const path = String(request.query?.path)
      if (request.path === "disk/resources/download") return { href: `https://downloader.disk.yandex.ru/${++issued}` }
      if (path === "disk:/Work/plan.txt") return file(path) as never
      const offset = Number(request.query?.offset ?? 0)
      const count = Math.max(0, Math.min(PAGE, folderSize - offset))
      return {
        path,
        name: "Work",
        type: "dir",
        resource_id: "fake-dir",
        _embedded: {
          items: Array.from({ length: count }, (_, i) => file(`${path}/f${offset + i}.txt`)),
          total: folderSize,
        },
      } as never
    },
  }
  const fetched: { href: string; range: string | null }[] = []
  let clock = 0
  const truncated: string[] = []
  const mount = diskMount({
    api,
    links: async (href, init) => {
      const headers = new Headers(init?.headers)
      fetched.push({ href: String(href), range: headers.get("range") })
      return links(String(href), headers)
    },
    root: "disk:/Work",
    now: () => clock,
    onTruncated: (path) => truncated.push(path),
  })
  return { mount, sent, fetched, truncated, tick: (ms: number) => (clock += ms) }
}

const text = (body: string, status = 200, headers: Record<string, string> = {}) =>
  new Response(body, { status, headers })

describe("diskMount", () => {
  it("lists under the mounted folder and joins paths below it", async () => {
    const { mount, sent } = setup(() => text("x"))
    const entries = await mount.list("/")
    expect(entries.map((entry) => entry.name)).toEqual(["f0.txt", "f1.txt"])
    expect(entries[0]).toMatchObject({ folder: false, size: 10, mime: "text/plain", version: "fakemd5" })
    await mount.stat("/plan.txt")
    expect(sent.map((request) => request.query?.path)).toEqual(["disk:/Work", "disk:/Work/plan.txt"])
  })

  it("stops a folder at its first entries and says so", async () => {
    const { mount, truncated } = setup(() => text("x"), MOST_SHOWN + PAGE * 2)
    expect(await mount.list("/")).toHaveLength(MOST_SHOWN)
    expect(truncated).toEqual(["disk:/Work"])
  })

  it("keeps a download link a minute and asks a new one after", async () => {
    const { mount, sent, tick } = setup(() => text("0123456789"))
    const entry = await mount.stat("/plan.txt")
    await mount.read("/plan.txt", entry)
    await mount.read("/plan.txt", entry)
    tick(61_000)
    await mount.read("/plan.txt", entry)
    expect(sent.filter((request) => request.path === "disk/resources/download")).toHaveLength(2)
  })

  it("asks a new link once when a kept one has run out", async () => {
    const { mount, fetched } = setup((href) => (href.endsWith("/1") && fetched.length > 1 ? text("", 410) : text("ok")))
    const entry = await mount.stat("/plan.txt")
    await mount.read("/plan.txt", entry)
    const read = await mount.read("/plan.txt", entry)
    expect(await new Response(read.body).text()).toBe("ok")
    expect(fetched.map((one) => one.href)).toEqual([
      "https://downloader.disk.yandex.ru/1",
      "https://downloader.disk.yandex.ru/1",
      "https://downloader.disk.yandex.ru/2",
    ])
  })

  it("passes a range on and takes a 206 for exactly that range", async () => {
    const { mount, fetched } = setup(() => text("234", 206, { "content-range": "bytes 2-4/10" }))
    const read = await mount.read("/plan.txt", await mount.stat("/plan.txt"), { start: 2, end: 4 })
    expect(read.ranged).toBe(true)
    expect(fetched[0]?.range).toBe("bytes=2-4")
  })

  it("passes a whole answer on as not ranged", async () => {
    const { mount } = setup(() => text("0123456789"))
    const read = await mount.read("/plan.txt", await mount.stat("/plan.txt"), { start: 2, end: 4 })
    expect(read.ranged).toBe(false)
  })

  it("refuses a 206 for another part of the file", async () => {
    const { mount } = setup(() => text("567", 206, { "content-range": "bytes 5-7/10" }))
    const entry = await mount.stat("/plan.txt")
    await expect(mount.read("/plan.txt", entry, { start: 2, end: 4 })).rejects.toMatchObject({ code: "provider_error" })
  })

  it("answers not_found when the link finds no file, and provider_error on another failure", async () => {
    const gone = setup(() => text("", 404))
    await expect(gone.mount.read("/plan.txt", await gone.mount.stat("/plan.txt"))).rejects.toMatchObject({
      code: "not_found",
    })
    const failing = setup(() => text("", 500))
    await expect(failing.mount.read("/plan.txt", await failing.mount.stat("/plan.txt"))).rejects.toMatchObject({
      code: "provider_error",
    })
  })
})
