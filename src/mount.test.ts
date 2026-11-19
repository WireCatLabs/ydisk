import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { createServer, request as httpRequest } from "node:http"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { run } from "./program.js"
import { FAKE_TOKEN, type FakeDisk, fakeDisk } from "./testing/fake-disk.js"
import { signedIn } from "./testing/harness.js"

const configFile = join(process.env.YDISK_CONFIG_DIR ?? "", "config.json")
afterEach(() => rmSync(configFile, { force: true }))

interface Answer {
  status: number
  headers: Record<string, string | string[] | undefined>
  body: string
}

const send = (url: URL, method: string, headers: Record<string, string> = {}): Promise<Answer> =>
  new Promise((resolve, reject) => {
    const outgoing = httpRequest(url, { method, agent: false, headers: { host: url.host, ...headers } }, (incoming) => {
      const chunks: Buffer[] = []
      incoming.on("data", (chunk: Buffer) => chunks.push(chunk))
      incoming.on("end", () =>
        resolve({
          status: incoming.statusCode ?? 0,
          headers: incoming.headers,
          body: Buffer.concat(chunks).toString(),
        }),
      )
      incoming.on("error", reject)
    })
    outgoing.on("error", reject)
    outgoing.end()
  })

const disk = () => {
  const service = fakeDisk()
  service.put("disk:/Work/plan.txt", "0123456789")
  service.put("disk:/Work/Sub/notes.md", "# notes")
  service.put("disk:/Private/key.txt", "not for the mount")
  return service
}

/** Runs `mount` as typed, waits for its address, and hands back a stop that ends it the way Ctrl-C does. */
const mount = async (argv: string[], service: FakeDisk = disk()) => {
  const out: string[] = []
  const err: string[] = []
  const stop = new AbortController()
  let printed: (url: URL) => void = () => undefined
  const ready = new Promise<URL>((resolve) => {
    printed = resolve
  })
  const done = run(["personal", "files", "serve", ...argv], {
    streams: {
      data: (text) => {
        out.push(text)
        const url = /http:\/\/127\.0\.0\.1:\d+\/[\w-]+\//u.exec(text)?.[0]
        if (url) printed(new URL(url))
      },
      diagnostic: (text) => err.push(text),
    },
    tty: false,
    keyring: signedIn(),
    fetch: service.fetch,
    signal: stop.signal,
  } as Parameters<typeof run>[1])
  const url = await Promise.race([ready, done.then(() => undefined)])
  return {
    url,
    service,
    out,
    err,
    end: async () => {
      stop.abort()
      return done
    },
  }
}

describe("files serve", () => {
  it("serves a Disk folder read-only and ends with exit 0 when stopped", async () => {
    const mounted = await mount(["/Work"])
    const url = mounted.url as URL
    expect(mounted.out.join("")).toContain(`gio mount dav://127.0.0.1:${url.port}${url.pathname}`)
    expect(mounted.out.join("")).not.toContain(FAKE_TOKEN)

    const listing = await send(url, "PROPFIND", { depth: "1" })
    expect(listing.status).toBe(207)
    expect(listing.body).toContain(`<D:href>${url.pathname}plan.txt</D:href>`)
    expect(listing.body).toContain(`<D:href>${url.pathname}Sub/</D:href>`)
    expect(listing.body).not.toContain("Private")

    const file = await send(new URL("plan.txt", url), "GET")
    expect(file.status).toBe(200)
    expect(file.body).toBe("0123456789")
    expect(file.headers["content-length"]).toBe("10")

    const inner = await send(new URL("Sub/notes.md", url), "GET")
    expect(inner.body).toBe("# notes")

    expect(await mounted.end()).toBe(0)
    expect(mounted.service.refusals).toEqual([])
    expect(mounted.service.calls.every((call) => call.method === "GET")).toBe(true)
  })

  it("answers a range with the whole file while Yandex's links are not documented to serve parts", async () => {
    const mounted = await mount(["/Work"])
    const answer = await send(new URL("plan.txt", mounted.url), "GET", { range: "bytes=2-4" })
    expect(answer.status).toBe(200)
    expect(answer.body).toBe("0123456789")
    const sent = mounted.service.calls.filter((call) => call.url.host === "downloader.disk.yandex.ru")
    expect(sent).toHaveLength(1)
    await mounted.end()
  })

  it("asks Yandex for a download link once per file and reads a cached listing for a stat", async () => {
    const mounted = await mount(["/Work"])
    const url = mounted.url as URL
    await send(url, "PROPFIND", { depth: "1" })
    await send(new URL("plan.txt", url), "PROPFIND", { depth: "0" })
    await send(new URL(".DS_Store", url), "PROPFIND", { depth: "0" })
    await send(new URL("plan.txt", url), "GET")
    await send(new URL("plan.txt", url), "GET")
    const api = mounted.service.calls.filter((call) => call.url.host === "cloud-api.yandex.net")
    expect(api.map((call) => call.url.pathname)).toEqual([
      "/v1/disk/resources",
      "/v1/disk/resources",
      "/v1/disk/resources",
      "/v1/disk/resources/download",
    ])
    await mounted.end()
  })

  it("refuses every write and never sends one to Yandex", async () => {
    const mounted = await mount([])
    for (const method of ["PUT", "DELETE", "MOVE", "COPY", "MKCOL", "PROPPATCH", "LOCK"]) {
      const answer = await send(new URL("Work/plan.txt", mounted.url), method)
      expect(answer.status, method).toBe(method === "MKCOL" ? 403 : 405)
    }
    await mounted.end()
    expect(mounted.service.calls.every((call) => call.method === "GET")).toBe(true)
    expect(mounted.service.nodes.get("disk:/Work/plan.txt")?.text).toBe("0123456789")
  })

  it("keeps a path that climbs out of the mounted folder from reaching Yandex", async () => {
    const mounted = await mount(["/Work"])
    const before = mounted.service.calls.length
    const answer = await send(new URL("..%2FPrivate%2Fkey.txt", mounted.url), "GET")
    expect(answer.status).toBe(400)
    expect(mounted.service.calls.length).toBe(before)
    await mounted.end()
  })

  it("refuses a file in place of a folder before it serves anything", async () => {
    const mounted = await mount(["/Work/plan.txt", "--json"])
    expect(mounted.url).toBeUndefined()
    expect(await mounted.end()).not.toBe(0)
    expect(mounted.err.join("") + mounted.out.join("")).toContain("files serve shows a folder")
  })

  it("answers the address and the mount steps as an item under --json", async () => {
    const mounted = await mount(["/Work", "--json"])
    const answer = JSON.parse(mounted.out.join("")) as { item: Record<string, unknown> }
    expect(answer.item).toMatchObject({ path: "disk:/Work", url: String(mounted.url), read_only: true })
    expect(answer.item.mount).toHaveProperty("windows", `net use * ${mounted.url}`)
    await mounted.end()
  })

  it("names a port another program holds", async () => {
    const taken = createServer()
    await new Promise<void>((resolve) => taken.listen(0, "127.0.0.1", resolve))
    const port = (taken.address() as { port: number }).port
    const mounted = await mount(["--port", String(port)])
    expect(await mounted.end()).not.toBe(0)
    expect(mounted.err.join("") + mounted.out.join("")).toContain(`port ${port} is in use`)
    taken.close()
  })

  it("refuses a port out of range", async () => {
    const mounted = await mount(["--port", "70000"])
    expect(await mounted.end()).not.toBe(0)
    expect(mounted.err.join("") + mounted.out.join("")).toContain("--port")
    expect(mounted.service.calls).toEqual([])
  })

  it("is refused where files.download is denied, before any request", async () => {
    mkdirSync(join(configFile, ".."), { recursive: true })
    writeFileSync(configFile, JSON.stringify({ profiles: { personal: { permissions: { "files.download": "deny" } } } }))
    const mounted = await mount([])
    expect(mounted.url).toBeUndefined()
    expect(await mounted.end()).not.toBe(0)
    expect(mounted.service.calls).toEqual([])
  })
})
