import { CliError } from "@wirecat/cli-base"
import type { FetchLike } from "@wirecat/cli-base/http"
import * as v from "valibot"
import { SERVICE } from "../identity.js"
import type { Request, Transport } from "./transport.js"

const Link = v.object({ href: v.string(), method: v.optional(v.string()) })
const UploadLink = v.object({ href: v.string(), operation_id: v.optional(v.string()) })
const Answer = v.optional(Link)
const PublicUrl = v.object({ public_url: v.optional(v.string()) })

export type Outcome = { status: "done" } | { status: "in-progress"; disk_operation: string }

/** A 202 names the operation the Disk goes on with; its id lets the caller check it later. */
const outcomeOf = (link: v.InferOutput<typeof Answer>): Outcome => {
  const id = link?.href.match(/\/operations\/([^/?]+)/u)?.[1]
  return id ? { status: "in-progress", disk_operation: id } : { status: "done" }
}

/**
 * The writes to the Disk, each one request of Yandex's REST API
 * (https://yandex.ru/dev/disk-api/doc/en/). Paths are the API's own, `disk:/…` or
 * `trash:/…`. Nothing here asks or checks a permission: the command does, before it calls.
 */
export const diskWrites = (api: Transport, links: FetchLike, signal?: AbortSignal) => {
  const send = async (request: Request) => outcomeOf(await api.send(request, Answer))
  return {
    createFolder: (path: string) => send({ method: "PUT", path: "disk/resources", query: { path } }),
    /** With `md5`, the Disk refuses with 409 when the file there now has other content. */
    trash: (path: string, md5?: string) =>
      send({ method: "DELETE", path: "disk/resources", query: { path, permanently: "false", md5 } }),
    restore: (trashPath: string) =>
      send({ method: "PUT", path: "disk/trash/resources/restore", query: { path: trashPath } }),
    transfer: (kind: "copy" | "move", from: string, to: string, replace: boolean) =>
      send({ method: "POST", path: `disk/resources/${kind}`, query: { from, path: to, overwrite: String(replace) } }),
    // The spec marks the body as required; an empty one keeps Yandex's default settings.
    publish: (path: string) => send({ method: "PUT", path: "disk/resources/publish", query: { path }, body: {} }),
    unpublish: (path: string) => send({ method: "PUT", path: "disk/resources/unpublish", query: { path } }),
    /** The public link, or undefined when the read fails or names none: the publish itself already happened. */
    publicUrl: (path: string): Promise<string | undefined> =>
      api.send({ method: "GET", path: "disk/resources", query: { path, fields: "public_url" } }, PublicUrl).then(
        (answer) => answer.public_url,
        () => undefined,
      ),
    /** A 202 means the Disk has the bytes but has not stored the file yet; its `disk_operation` says when it has. */
    upload: async (path: string, body: Blob, replace: boolean): Promise<Outcome> => {
      // The link lives 30 minutes and takes the bytes without the token (https://yandex.ru/dev/disk-api/doc/en/reference/upload).
      const link = await api.send(
        { method: "GET", path: "disk/resources/upload", query: { path, overwrite: String(replace) } },
        UploadLink,
      )
      let response: Response
      try {
        response = await links(link.href, { method: "PUT", body, ...(signal ? { signal } : {}) })
      } catch (error) {
        // Only a request that never left is safe to call failed; the bytes may have landed otherwise (WC-LIFE-9).
        if (error instanceof CliError && error.details.sent === false) throw error
        throw new CliError(
          "outcome_unknown",
          `${SERVICE} did not answer the upload; check the file before sending it again`,
          {
            retryable: false,
          },
        )
      }
      if (response.status === 413)
        throw new CliError("validation_error", `${SERVICE} refuses a file this large for this account`)
      if (response.status === 507) throw new CliError("validation_error", `the ${SERVICE} is full`)
      if (response.status >= 400 && response.status < 500)
        throw new CliError("validation_error", `${SERVICE} refused the upload (HTTP ${response.status})`, {
          status: response.status,
        })
      if (!response.ok)
        throw new CliError("outcome_unknown", `the ${SERVICE} upload ended with HTTP ${response.status}`, {
          status: response.status,
          retryable: false,
        })
      return response.status === 202 && link.operation_id
        ? { status: "in-progress", disk_operation: link.operation_id }
        : { status: "done" }
    },
  }
}
