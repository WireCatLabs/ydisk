# Changelog

Notable changes to `@wirecat/yandex-disk-cli`. One section per version, newest first.

## 0.2.0 — 18.11.2026

### Added

- `ydisk store info` shows the shared store's file, size, format and row counts, so WireCat Desktop can say whether
  Yandex Disk reads it.
- `ydisk <profile> account remove --keep-data|--delete-data` signs the profile out and forgets it on this computer. It
  keeps or deletes the chosen folders and the synced files.
- `folders browse` gives each folder a `kind` and a `has_children`. Yandex gives no child count, so it looks inside each
  folder, one request each, when the level has 20 folders or fewer; with more, `has_children` is `null`.

### Fixed

- Published from GitHub Actions with npm provenance, so WireCat Desktop installs it: Desktop refuses a built-in tool's
  release that its own repository's workflow did not build, and 0.1.0 was published from a computer.
- **The guides cover what the tool does, step by step.** New pages: [find a document](docs/search.md) (words,
  word forms, meaning, file names), [connect your agent](docs/mcp.md) (the skill, `mcp add`, `mcp config`, browser
  apps and what an agent may change), [recipes](docs/recipes.md) and [compared with other tools](docs/compare.md).
  [Install and sign in](docs/installation.md) walks through getting the Yandex token with Yandex's own labels,
  [troubleshooting](docs/troubleshooting.md) is by symptom with the exit codes, and [security](docs/security.md)
  says what stays on your computer and how to remove it. The token steps now name the app type "For API access or
  debugging", as Yandex's pages do.
- The help and the error of `--cursor` in `folders browse` and `files list` name `page.next_cursor`, the key the answer
  has, not `page.next`.

## 0.1.0 — 17.11.2026

### Added

- Started from `@wirecat/cli-template` 0.25.0.
- **Sign in with a Yandex OAuth token** pasted once: `session start` reads it hidden or from stdin, checks it with
  `GET /v1/disk` and keeps it in the system keyring; `session status --check` and `doctor --online` say whose it is.
- **Chosen Disk folders as searchable text**: `folders add <path>`, `sync`, `status`, `documents list|show|export`,
  `search`, `catalog`, tags, notes and memories, cli-core's shared documents commands. Each sync walks the chosen
  folders again (the Disk API has no change feed) and reads only files whose MD5 changed; a moved file keeps its id,
  tags and notes. Text from PDF, docx, xlsx, CSV, TSV, text and Markdown. Times are kept and answered in UTC.
- **The files live**: `files list|show|download|upload|copy|move|create|delete|restore|publish|unpublish`, by Disk
  path. `files delete` moves to the trash. `--replace` and `files delete` ask as `files.delete` does, `files publish`
  as `files.share` does, and `--dry-run` shows each key the write checks. `files publish` answers the public link, or
  leaves `public_url` out when it cannot read it back. Downloads and uploads go to the address Yandex gives, without
  the token.
- **`api`**: one command per operation of Yandex's Swagger 1.2 description, 20 in all. The three that answer a
  download or upload link are left out, and a resource's `file`, `preview` and `sizes` links are taken out of every
  answer. `--all` pages where the API pages. A permanent delete, `overwrite=true` and a public link ask by
  `files.delete` and `files.share`. An operation that does what a `files` command does also checks that command's
  key: `files.move: deny` stops `api resources-move` too, in the run and in `--dry-run`.
