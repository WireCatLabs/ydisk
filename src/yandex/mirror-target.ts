import { createWriteStream, openAsBlob } from "node:fs"
import { posix } from "node:path"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import type { ReadableStream } from "node:stream/web"
import { CliError, isCliError } from "@wirecat/cli-base"
import type { FetchLike } from "@wirecat/cli-base/http"
import type { Expect, FileTarget, RemoteFile } from "@wirecat/cli-core/documents"
import * as v from "valibot"
import { SERVICE } from "../identity.js"
import { PAGE } from "./source.js"
import type { Transport } from "./transport.js"
import { diskWrites } from "./writes.js"

// The fields a mirror reads; Yandex sends them on every file by default
// (https://yandex.ru/dev/disk-api/doc/en/reference/response-objects). No `fields` filter: one spelled wrong would
// drop sha256 on the real Disk while the fake still sent it.
const Resource = v.object({
  path: v.string(),
  type: v.picklist(["dir", "file"]),
  resource_id: v.string(),
  modified: v.optional(v.string()),
  size: v.optional(v.number()),
  md5: v.optional(v.string()),
  sha256: v.optional(v.string()),
})
type Resource = v.InferOutput<typeof Resource>
const Listing = v.object({
  ...Resource.entries,
  _embedded: v.optional(v.object({ items: v.array(Resource), total: v.optional(v.number()) })),
})
const Link = v.object({ href: v.string() })
const User = v.object({ user: v.object({ uid: v.string() }) })
const Revision = v.object({ revision: v.number() })

/** A mirror holds at most this many files; past it the listing is incomplete and proves no deletion. */
export const MAX_MIRROR_FILES = 10_000

const statusOf = (error: unknown) => (isCliError(error) ? error.details?.status : undefined)

const changed = (path: string) => new CliError("conflict", `the ${SERVICE} file ${path} is not the one the sync listed`)

/**
 * Yandex Disk as the file mirror's remote (cli-core `FileTarget`). Paths are the API's own, `disk:/Notes/a.md`. The
 * API has no conditional write, so a replace reads the file just before it and an upload keeps the `resource_id`
 * (checked live, scripts/live.sh); a delete passes the expected md5, which the Disk itself checks (HTTP 409).
 */
export const diskTarget = (api: Transport, links: FetchLike, signal?: AbortSignal): FileTarget => {
  const writes = diskWrites(api, links, signal)
  const read = async (path: string) => {
    try {
      return await api.send({ method: "GET", path: "disk/resources", query: { path, limit: 0 } }, Listing)
    } catch (error) {
      if (isCliError(error) && error.code === "not_found") return undefined
      throw error
    }
  }
  const remoteFile = (resource: Resource, root: string): RemoteFile => {
    const modified = resource.modified === undefined ? Number.NaN : Date.parse(resource.modified)
    return {
      path: resource.path.slice(root.length),
      id: resource.resource_id,
      size: resource.size ?? 0,
      ...(resource.sha256 ? { sha256: resource.sha256 } : {}),
      ...(resource.md5 ? { md5: resource.md5 } : {}),
      modifiedAt: Number.isNaN(modified) ? new Date(0).toISOString() : new Date(modified).toISOString(),
    }
  }
  const prefixOf = (root: string) => (root.endsWith("/") ? root : `${root}/`)
  /** The file as it is now, checked against what the sync listed; refuses with `conflict` when it is not. */
  const check = async (path: string, expect: Exclude<Expect, { absent: true }>) => {
    const now = await read(path)
    if (now?.type !== "file") throw changed(path)
    if (now.sha256 !== undefined ? now.sha256 !== expect.sha256 : expect.md5 !== undefined && now.md5 !== expect.md5)
      throw changed(path)
    return now
  }

  const ensureFolder = async (path: string): Promise<void> => {
    try {
      await writes.createFolder(path)
    } catch (error) {
      if (statusOf(error) !== 409) throw error
      const there = await read(path)
      if (there?.type === "dir") return
      if (there) throw new CliError("conflict", `${path} is a file on ${SERVICE}, not a folder`)
      // 409 with nothing at the path: its parent is missing.
      const parent = `disk:${posix.dirname(path.replace(/^disk:/u, ""))}`
      if (parent === path) throw error
      await ensureFolder(parent)
      await writes.createFolder(path)
    }
  }

  return {
    identity: async () => (await api.send({ method: "GET", path: "disk", query: { fields: "user" } }, User)).user.uid,

    list: async (root) => {
      const top = await read(root)
      if (!top) return undefined
      if (top.type !== "dir")
        throw new CliError("validation_error", `${root} is a file on ${SERVICE}, not a folder`, {
          reason: "mirror.not-folder",
        })
      const prefix = prefixOf(top.path)
      const files: RemoteFile[] = []
      const folders = [top.path]
      let complete = true
      while (folders.length) {
        const folder = folders.shift() as string
        for (let offset = 0; ; offset += PAGE) {
          let answer: v.InferOutput<typeof Listing>
          try {
            answer = await api.send(
              { method: "GET", path: "disk/resources", query: { path: folder, limit: PAGE, offset, sort: "name" } },
              Listing,
            )
          } catch (error) {
            // A folder the token cannot read, or one gone mid-walk, leaves the listing incomplete; a refused token or
            // a stop ends the sync.
            if (!isCliError(error) || ["authentication_error", "cancelled", "rate_limited"].includes(error.code))
              throw error
            complete = false
            break
          }
          const items = answer._embedded?.items ?? []
          for (const item of items) {
            if (item.type === "dir") folders.push(item.path)
            else files.push(remoteFile(item, prefix))
          }
          if (files.length > MAX_MIRROR_FILES) return { rootId: top.resource_id, files, complete: false }
          if (items.length < PAGE || (answer._embedded?.total ?? Number.POSITIVE_INFINITY) <= offset + PAGE) break
        }
      }
      return { rootId: top.resource_id, files, complete }
    },

    download: async (path, into) => {
      const { href } = await api.send({ method: "GET", path: "disk/resources/download", query: { path } }, Link)
      // The link carries its own grant; linkFetch refuses to send the token there.
      const response = await links(href, { redirect: "follow", ...(signal ? { signal } : {}) })
      if (!response.ok || !response.body)
        throw new CliError(response.status === 404 ? "not_found" : "provider_error", `the ${SERVICE} download failed`, {
          status: response.status,
        })
      await pipeline(
        Readable.fromWeb(response.body as ReadableStream<Uint8Array>),
        createWriteStream(into, { flags: "wx" }),
      )
    },

    upload: async (path, from, expect) => {
      // A new file asks the Disk not to overwrite, so one created meanwhile is refused by the Disk itself (409).
      // A replace has no such check: the window is the few seconds between this read and the upload.
      if (!("absent" in expect)) await check(path, expect)
      try {
        await writes.upload(path, await openAsBlob(from), !("absent" in expect))
      } catch (error) {
        if (statusOf(error) === 409) throw changed(path)
        throw error
      }
      const now = await read(path)
      if (!now) throw new CliError("outcome_unknown", `${SERVICE} does not list the file it took`)
      return remoteFile(now, prefixOf(posix.dirname(now.path)))
    },

    trash: async (path, expect) => {
      const md5 = expect.md5 ?? (await check(path, expect))?.md5
      try {
        await writes.trash(path, md5)
      } catch (error) {
        if (statusOf(error) === 409) throw changed(path)
        throw error
      }
    },

    ensureFolder: (path) => ensureFolder(path),

    revision: async () =>
      String((await api.send({ method: "GET", path: "disk", query: { fields: "revision" } }, Revision)).revision),
  }
}
