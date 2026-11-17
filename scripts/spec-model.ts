import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { type ApiModel, adaptOpenApi, patchSpec, type SpecPatch, upgradeToOpenApi3 } from "@wirecat/cli-base/codegen"

interface Provenance {
  sources: { name: string; url: string; file: string; sha256: string }[]
}

interface Listing {
  basePath: string
  apis: { path: string; description?: string | null }[]
}

const LISTING = "listing"

// Entries of the resource listing the CLI does not read, each with why.
const LEFT_OUT: Readonly<Record<string, string>> = {
  "/v1/data/admin/settings/{settings_name}/organizations/{org_id}":
    "Yandex 360 organization settings for admins, not a person's Disk; <https://yandex.ru/dev/disk-api/doc/en/> does not describe it",
}

// Corrections to the service's document, each with the reason from its documentation or a captured answer.
const PATCHES: SpecPatch[] = []

/**
 * The Swagger 1.2 listing and its declarations as committed, checked against provenance.json, upgraded to OpenAPI 3,
 * then corrected.
 */
export const specModel = async (root: string): Promise<{ model: ApiModel; notes: string[] }> => {
  const dir = join(root, "spec/ydisk")
  const provenance = JSON.parse(readFileSync(join(dir, "provenance.json"), "utf8")) as Provenance
  const documents = new Map(
    provenance.sources.map((source) => {
      const text = readFileSync(join(dir, source.file), "utf8")
      if (createHash("sha256").update(text).digest("hex") !== source.sha256)
        throw new Error(`spec/ydisk/${source.file} does not match provenance.json; run pnpm spec:sync`)
      return [source.name, { url: source.url, document: JSON.parse(text) as unknown }]
    }),
  )
  const listed = documents.get(LISTING)
  if (!listed) throw new Error(`spec/ydisk/provenance.json lists no source named "${LISTING}"`)
  const listing = listed.document as Listing
  // Each declaration is served at the listing's basePath followed by its entry's path, which keys it.
  const declarations = Object.fromEntries(
    [...documents]
      .filter(([name]) => name !== LISTING)
      .map(([, { url, document }]) => [decodeURI(url.slice(listing.basePath.length)), document]),
  )
  const unknown = listing.apis.filter(({ path }) => !(path in declarations) && !(path in LEFT_OUT))
  if (unknown.length)
    throw new Error(
      `The listing has entries neither synced nor left out: ${unknown.map(({ path }) => path).join(", ")}`,
    )
  const read = { ...listing, apis: listing.apis.filter(({ path }) => path in declarations) }
  const upgraded = await upgradeToOpenApi3(read, declarations)
  const { document, applied } = patchSpec(upgraded, { patches: PATCHES })
  const model = adaptOpenApi(document, {
    sourceUrl: provenance.sources.map((source) => source.url).join(" "),
    sourceRevision: provenance.sources.map((source) => source.sha256).join(" "),
  })
  return {
    model,
    notes: [
      ...Object.entries(LEFT_OUT).map(([path, reason]) => `left out ${path}: ${reason}`),
      ...applied.map(({ pointer, reason }) => `patched ${pointer}: ${reason}`),
    ],
  }
}
