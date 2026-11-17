### Added

- **Sign in with a Yandex OAuth token** pasted once: `session start` reads it hidden or from stdin, checks it with
  `GET /v1/disk` and keeps it in the system keyring; `session status --check` says whose it is.
- **Chosen Disk folders as searchable text**: `folders add <path>`, `sync`, `status`, `documents list|show|export`,
  `search`, `catalog`, tags, notes and memories, cli-core's shared documents commands. Each sync walks the chosen
  folders again (the Disk API has no change feed) and reads only files whose MD5 changed; a moved file keeps its id,
  tags and notes. Text from PDF, docx, xlsx, CSV, TSV, text and Markdown.
- **The files live**: `files list|show|download|upload|copy|move|create|delete|restore|publish|unpublish`, by Disk
  path. `files delete` moves to the trash. `--replace` and `files delete` ask as `files.delete` does, `files publish`
  as `files.share` does. Downloads and uploads go to the address Yandex gives, without the token.
- **`api`**: one command per operation of Yandex's Swagger 1.2 description, 20 in all; the three that answer a download or upload link are left out, and a resource's `file`, `preview` and
  `sizes` links are taken out of every answer, with `--all` paging where the
  API pages; a permanent delete, `overwrite=true` and a public link ask by `files.delete` and `files.share`.
