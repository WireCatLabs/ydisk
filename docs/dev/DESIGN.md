# ydisk — design

## Answers

- **Category:** files and documents
- **Content languages:** ru, en.
- **Sign-in:** a Yandex OAuth token pasted on stdin (the owner's decision, 2026-11-17). Yandex ID's PKCE flow needs
  no app secret, but renewing a token does ([refresh](https://yandex.ru/dev/id/doc/en/tokens/refresh-client)), so a
  browser sign-in waits for an OAuth provider in cli-core.
- **Access:** read and write: `cloud_api:disk.read`, `cloud_api:disk.write`, `cloud_api:disk.info`. A pasted token
  carries what its app was registered with; the CLI asks for nothing more.
- **The API:** Yandex's official [Disk REST API](https://yandex.ru/dev/disk-api/doc/en/). Its Swagger 1.2
  description (`https://cloud-api.yandex.net/v1/schema`) generates the `api` group.
- **How people filter:** by time, by folder, by words in the text.
- **Never in the store, a log or the output:** the token; download and upload links (they carry their own grant);
  `public_url` and `public_key` are not kept by the sync.
- **Untrusted input:** file text, file and folder names, links.

## Reference CLI

[drive-cli](https://github.com/WireCatLabs/drive-cli) for the command tree and the words;
[notion-cli](https://github.com/WireCatLabs/notion-cli) for the sign-in by token and the source contracts. Both are
on cli-core's shared documents commands.

| ydisk | drive | Why it differs |
|---|---|---|
| `session start` reads a token | browser OAuth | Yandex renews a token only with an app secret |
| `files show`, `files create`, `files delete` | `files get`, `files mkdir`, `files trash` | the shared vocabulary's verbs; drive keeps its older words in a lint baseline |
| `--folder <path>`, `--name`, `--replace` | `--parent <id>`, `--overwrite` | the vocabulary's flags; the Disk API addresses by path |
| `files publish`, `files unpublish` | `permissions` | the Disk has public links, not per-person sharing |
| no `mirrors`, `sheets`, `comments`, `revisions` | — | Google-only, or (mirrors) a two-way engine port not built for the Disk yet |

## The source

- **Ids and paths.** Every operation of the API takes a path; none takes the `resource_id` it returns. The sync keeps
  `resource_id` as the document id, so a moved file keeps its tags and notes, and keeps the path in
  `providerMetadata.path`. cli-core passes the file it last listed to `metadata`, `children` and `content`, which read
  the path from it ([cli-core Documents](https://github.com/WireCatLabs/cli-core/blob/main/docs/dev/DOCUMENTS.md#a-source-without-a-change-feed)).
- **No change feed.** The API has none, so the source is a `FeedlessDocumentSource`: each sync walks the chosen
  folders in full, reads only files whose MD5 changed, and drops what the finished pass did not find. A chosen
  folder that moved answers 404 and is skipped as unavailable, its copies removed; adding it again under its new
  path brings it back (cli-core 0.690.0 and later).
- **Text** comes from cli-core's `fileText`; folders are walked a page of 200 at a time (`childrenPage`).
- **Links.** Downloads and uploads go through cli-core's `linkFetch` to the hosts in `src/identity.ts`, never with the
  token. The hosts come from Yandex's docs and are confirmed by the owner's live check.
- **Writes** (`files …`) go through the profile's guard and the send journal, and are never retried. An answer 202
  names the Disk's own operation; `api operations-get` follows it.

## What is hand-written

`src/yandex/` (transport, source), `src/commands/{library,files}.ts`, `src/context.ts` and the tests with their fakes
(`src/testing/fake-disk.ts`, an in-memory Disk; `src/testing/disk-api.ts`, cli-base's strict fake from the spec).
The documents commands, the sync engine, the store, search and MCP are cli-core's; the `api` group is generated.

## Open questions for the owner

- The download and upload host names (`downloader.disk.yandex.ru`, `*.disk.yandex.net`) are from Yandex's docs; the
  first live check confirms them.
- Yandex documents no rate limit; the pace is 120 requests a minute per profile until a 429 says otherwise.
