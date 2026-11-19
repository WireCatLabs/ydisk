import { createWriteStream, openAsBlob } from "node:fs"
import { posix } from "node:path"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import type { ReadableStream } from "node:stream/web"
import { setTimeout as sleep } from "node:timers/promises"
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
const Operation = v.object({ status: v.string() })

/** A listing walked while the Disk changed is walked again this many times before it is called incomplete. */
const WALKS = 3
/** How long an upload the Disk answered 202 is waited for, polling its operation from 250 ms up to 5 s apart. */
const UPLOAD_WAIT_MS = 120_000

/** A mirror holds at most this many files; past it the listing is incomplete and proves no deletion. */
export const MAX_MIRROR_FILES = 10_000

const statusOf = (error: unknown) => (isCliError(error) ? error.details?.status : undefined)

const changed = (path: string) => new CliError("conflict", `the ${SERVICE} file ${path} is not the one the sync listed`)
const unproven = (path: string) =>
  new CliError("conflict", `${SERVICE} gives no hash for ${path}, so the sync cannot prove it is the file it listed`)

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
  /**
   * The file as it is now, checked against what the sync listed; refuses with `conflict` when it is not, or when no
   * hash on both sides can show that it is.
   */
  const check = async (path: string, expect: Exclude<Expect, { absent: true }>) => {
    const now = await read(path)
    if (now?.type !== "file") throw changed(path)
    if (now.sha256 !== undefined) {
      if (now.sha256 !== expect.sha256) throw changed(path)
    } else if (now.md5 === undefined || expect.md5 === undefined) throw unproven(path)
    else if (now.md5 !== expect.md5) throw changed(path)
    return now
  }
  const revisionOf = async () =>
    (await api.send({ method: "GET", path: "disk", query: { fields: "revision" } }, Revision)).revision

  /** Every file under `top`, by offset pages: an entry that moves while the pages are read can be missed. */
  const walk = async (top: Resource) => {
    const prefix = prefixOf(top.path)
    const files: RemoteFile[] = []
    const folders = [top.path]
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
          return { files, complete: false }
        }
        const items = answer._embedded?.items ?? []
        for (const item of items) {
          if (item.type === "dir") folders.push(item.path)
          else files.push(remoteFile(item, prefix))
        }
        if (files.length > MAX_MIRROR_FILES) return { files, complete: false }
        if (items.length < PAGE || (answer._embedded?.total ?? Number.POSITIVE_INFINITY) <= offset + PAGE) break
      }
    }
    return { files, complete: true }
  }

  /** Waits for an upload the Disk took with 202 to land, so the read after it sees the new file. */
  const landed = async (path: string, operation: string) => {
    const until = Date.now() + UPLOAD_WAIT_MS
    for (let pause = 250; ; pause = Math.min(pause * 2, 5_000)) {
      const { status } = await api.send({ method: "GET", path: `disk/operations/${operation}` }, Operation)
      if (status === "success") return
      if (status === "failed") throw new CliError("provider_error", `${SERVICE} could not store the upload of ${path}`)
      if (Date.now() + pause > until)
        throw new CliError("outcome_unknown", `${SERVICE} is still storing ${path}; the next sync checks it`, {
          retryable: false,
        })
      await sleep(pause, undefined, signal ? { signal } : {})
    }
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
      // The Disk's revision moves with every change on it: a walk it did not move under missed nothing.
      for (let walks = 1; ; walks++) {
        const before = await revisionOf()
        const walked = await walk(top)
        if (!walked.complete || (await revisionOf()) === before)
          return { rootId: top.resource_id, files: walked.files, complete: walked.complete }
        if (walks === WALKS) return { rootId: top.resource_id, files: walked.files, complete: false }
      }
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
      // A new file asks for its upload link with overwrite=false, and the Disk refuses the link (409) when a file is
      // there by then; nothing checks one created between the link and the bytes. A replace is checked by the read
      // just before it.
      if (!("absent" in expect)) await check(path, expect)
      let sent: Awaited<ReturnType<typeof writes.upload>>
      try {
        sent = await writes.upload(path, await openAsBlob(from), !("absent" in expect))
      } catch (error) {
        if (statusOf(error) === 409) throw changed(path)
        throw error
      }
      if (sent.status === "in-progress") await landed(path, sent.disk_operation)
      const now = await read(path)
      if (!now) throw new CliError("outcome_unknown", `${SERVICE} does not list the file it took`)
      return remoteFile(now, prefixOf(posix.dirname(now.path)))
    },

    trash: async (path, expect) => {
      const md5 = expect.md5 ?? (await check(path, expect)).md5
      // Without an md5 the Disk would trash whatever is at the path now.
      if (md5 === undefined) throw unproven(path)
      try {
        await writes.trash(path, md5)
      } catch (error) {
        if (statusOf(error) === 409) throw changed(path)
        throw error
      }
    },

    ensureFolder: (path) => ensureFolder(path),

    revision: async () => String(await revisionOf()),
  }
}
