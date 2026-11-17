import { createHash } from "node:crypto"
import { posix } from "node:path"

// A strict fake of the Yandex Disk REST API, from https://yandex.ru/dev/disk-api/doc/en/reference/meta (listing),
// …/content (download link) and …/upload (upload link). It refuses an unknown path or parameter, a call without
// `OAuth <token>`, and a download that carries the token. Visibly fake data only (WC-TEST-8).

/** Spelled so gitleaks lets it through; never a real token. */
export const FAKE_TOKEN = "wirecatfake0token42"

const API = "cloud-api.yandex.net"
const DOWNLOADS = "downloader.disk.yandex.ru"

interface Node {
  path: string
  type: "dir" | "file"
  resource_id: string
  text?: string
  mime_type?: string
  md5?: string
  modified: string
}

export interface FakeDisk {
  fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>
  nodes: Map<string, Node>
  calls: { method: string; url: URL; auth: string | null }[]
  refusals: string[]
  put(path: string, text?: string, mime?: string): string
  remove(path: string): void
  move(from: string, to: string): void
  /** Makes a file answer this status from now on. */
  deny(path: string, status: 403 | 404): void
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })

const ALLOWED: Record<string, readonly string[]> = {
  "/v1/disk": ["fields"],
  "/v1/disk/resources": ["path", "limit", "offset", "sort", "fields"],
  "/v1/disk/resources/download": ["path"],
}

export const fakeDisk = (): FakeDisk => {
  let ids = 0
  const nodes = new Map<string, Node>()
  const denied = new Map<string, 403 | 404>()
  const calls: FakeDisk["calls"] = []
  const refusals: string[] = []
  const at = (path: string, type: Node["type"], text?: string, mime?: string) => {
    const known = nodes.get(path)
    const node: Node = {
      path,
      type,
      resource_id: known?.resource_id ?? `fake-${++ids}`,
      modified: `2026-01-0${(ids % 9) + 1}T00:00:00+00:00`,
      ...(type === "file"
        ? {
            text: text ?? "",
            mime_type: mime ?? "text/plain",
            md5: createHash("md5")
              .update(text ?? "")
              .digest("hex"),
          }
        : {}),
    }
    nodes.set(path, node)
    return node.resource_id
  }
  const resource = (node: Node) => ({
    path: node.path,
    name: node.path === "disk:/" ? "disk" : posix.basename(node.path),
    type: node.type,
    resource_id: node.resource_id,
    created: "2026-01-01T00:00:00+00:00",
    modified: node.modified,
    ...(node.type === "file"
      ? { size: node.text?.length ?? 0, mime_type: node.mime_type, md5: node.md5, revision: 1 }
      : {}),
  })
  const childrenOf = (path: string) =>
    [...nodes.values()]
      .filter(
        (node) => node.path !== path && posix.dirname(node.path.replace("disk:", "")) === path.replace("disk:", ""),
      )
      .sort((a, b) => a.path.localeCompare(b.path))
  at("disk:/", "dir")
  const refuse = (why: string) => {
    refusals.push(why)
    return json(400, { error: "FakeRefused", description: why })
  }
  const fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    const auth = new Headers(init?.headers).get("authorization")
    calls.push({ method: init?.method ?? "GET", url, auth })
    if (url.host === DOWNLOADS) {
      if (auth) return refuse("the download link was sent the token")
      const node = nodes.get(url.searchParams.get("path") ?? "")
      return node?.type === "file" ? new Response(node.text ?? "") : json(404, { error: "DiskNotFoundError" })
    }
    if (url.host !== API) return refuse(`unknown host ${url.host}`)
    if (auth !== `OAuth ${FAKE_TOKEN}`) return json(401, { error: "UnauthorizedError" })
    const allowed = ALLOWED[url.pathname]
    if (!allowed || (init?.method ?? "GET") !== "GET") return refuse(`no such operation ${url.pathname}`)
    for (const key of url.searchParams.keys()) if (!allowed.includes(key)) return refuse(`unknown parameter ${key}`)
    if (url.pathname === "/v1/disk")
      return json(200, { total_space: 1, used_space: 0, user: { uid: "1000", login: "test-person" } })
    const path = url.searchParams.get("path") ?? ""
    const status = denied.get(path)
    if (status) return json(status, { error: status === 403 ? "DiskForbiddenError" : "DiskNotFoundError" })
    const node = nodes.get(path)
    if (!node) return json(404, { error: "DiskNotFoundError" })
    if (url.pathname === "/v1/disk/resources/download") {
      const href = new URL(`https://${DOWNLOADS}/disk/fake`)
      href.searchParams.set("path", path)
      return json(200, { href: href.toString(), method: "GET", templated: false })
    }
    const limit = Number(url.searchParams.get("limit") ?? 20)
    const offset = Number(url.searchParams.get("offset") ?? 0)
    const all = node.type === "dir" ? childrenOf(path) : []
    return json(200, {
      ...resource(node),
      ...(node.type === "dir"
        ? {
            _embedded: {
              path,
              items: all.slice(offset, offset + limit).map(resource),
              limit,
              offset,
              total: all.length,
            },
          }
        : {}),
    })
  }
  return {
    fetch,
    nodes,
    calls,
    refusals,
    put: (path, text, mime) => {
      for (let dir = posix.dirname(path.replace("disk:", "")); dir !== "/"; dir = posix.dirname(dir))
        if (!nodes.has(`disk:${dir}`)) at(`disk:${dir}`, "dir")
      return text === undefined ? at(path, "dir") : at(path, "file", text, mime)
    },
    remove: (path) => {
      for (const key of [...nodes.keys()]) if (key === path || key.startsWith(`${path}/`)) nodes.delete(key)
    },
    move: (from, to) => {
      for (const [key, node] of [...nodes.entries()])
        if (key === from || key.startsWith(`${from}/`)) {
          nodes.delete(key)
          const moved = `${to}${key.slice(from.length)}`
          nodes.set(moved, { ...node, path: moved })
        }
    },
    deny: (path, status) => {
      denied.set(path, status)
    },
  }
}
