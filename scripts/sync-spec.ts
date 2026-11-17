import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

interface Source {
  name: string
  url: string
  file: string
}

// Yandex Disk publishes Swagger 1.2: a resource listing (https://cloud-api.yandex.net/v1/schema) and one API
// declaration per entry, served at the listing's basePath followed by the entry's path. provenance.json lists the
// listing first and each declaration the CLI uses; scripts/spec-model.ts says which entry is left out and why.
const dir = resolve(import.meta.dirname, "../spec/ydisk")
const listed = JSON.parse(readFileSync(join(dir, "provenance.json"), "utf8")) as { sources: Source[] }
const sources = []
for (const { name, url, file } of listed.sources) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: "error" })
  if (!response.ok) throw new Error(`${url} answered HTTP ${response.status}`)
  const text = await response.text()
  const document = JSON.parse(text) as { swaggerVersion?: unknown }
  if (document.swaggerVersion !== "1.2") throw new Error(`${url} is not a Swagger 1.2 document`)
  writeFileSync(join(dir, file), text)
  sources.push({ name, url, file, sha256: createHash("sha256").update(text).digest("hex") })
}
const provenance = { sources, retrieved_at: new Date().toISOString() }
writeFileSync(join(dir, "provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`)
process.stderr.write("The API documents are refreshed; review their diff, then run pnpm generate\n")
