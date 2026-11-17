import { type Configuration, commandPermissions, serviceApiPermissions, settingsFor } from "@wirecat/cli-core/cli"
import * as manifest from "./generated/manifest.js"
import { IDENTITY } from "./identity.js"

/** Each command is checked against its own path (`notes.list`); add the keys a command checks inside itself. */
// The keys a delete or a share checks (`files.delete`, `files.share`) come from `permissions` in scripts/generate.ts.
// An operation that answers with a credential is left out: the CLI signs in through `session`, and the api group would
// drop it anyway.
export const API = {
  manifest: { ...manifest, operations: manifest.operations.filter((operation) => !operation.response?.sensitive) },
  service: "Yandex Disk",
}

export const permissions = commandPermissions(serviceApiPermissions(API))

export const configuration: Configuration = settingsFor(IDENTITY, { permissions })
