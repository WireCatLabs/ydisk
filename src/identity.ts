import type { ManifestIdentity } from "@wirecat/cli-base/wcat/manifest"
import type { AppIdentity } from "@wirecat/cli-core/cli"
import { VERSION } from "./version.js"

export const PACKAGE = "@wirecat/yandex-disk-cli"

export const IDENTITY: AppIdentity = {
  command: "ydisk",
  appName: "yandex-disk-cli",
  envPrefix: "YDISK",
  description: "a new WireCat CLI, started from cli-template",
  version: VERSION,
  issues: "https://github.com/WireCatLabs/ydisk/issues/new",
  messenger: false,
  contentLanguages: ["ru", "en"],
}

// What `wcat` and WireCat Desktop show before the tool is installed: rewrite the tagline and the sign-in texts for
// yours. The bin passes it to wcatStart before anything else loads; src/wcat.ts adds the permission keys.
export const DESKTOP: ManifestIdentity = {
  ...IDENTITY,
  docs: "https://github.com/WireCatLabs/ydisk#readme",
  // SAMPLE: every host the CLI contacts (WC-CMD-32); src/sample/transport.ts reaches only these.
  hosts: ["comments.example.invalid"],
  tagline: "A new WireCat CLI, started from cli-template",
  signIn: {
    gives: "Lets your agent read and change your account through ydisk.",
    asks: "An API token or key from the service.",
  },
}

export const SKILL = new URL("../skills/yandex-disk-cli/SKILL.md", import.meta.url)
