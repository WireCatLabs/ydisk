# ydisk

`ydisk` gives you and your AI agent your Yandex Disk from the command line. It copies the text of the folders you
choose into WireCat's local store, where `search` finds it by words or by meaning, beside your messages and notes. It
also works with the files live: list, download, upload, copy, move, delete to the trash, restore and public links.

It uses Yandex's official [Disk REST API](https://yandex.ru/dev/disk-api/doc/en/). Text is read from PDF, docx,
xlsx, CSV, TSV, plain text and Markdown files; other files are kept by name.

## Install

Node.js 22.16 or a later 22.x, or 24 or later:

```sh
npm install -g @wirecat/yandex-disk-cli
ydisk --version
ydisk doctor
```

## Sign in

`ydisk` signs in with a Yandex OAuth token, which you paste once. It is kept in the system keyring, or in a private
file only you can read where no keyring works; never in an argument or the output.

1. Register an app at [oauth.yandex.com/client/new](https://oauth.yandex.com/client/new/), platform "Web services",
   redirect URI `https://oauth.yandex.ru/verification_code`, with the access `cloud_api:disk.read`,
   `cloud_api:disk.write` and `cloud_api:disk.info` (only `disk.read` and `disk.info` for a read-only token).
2. Open `https://oauth.yandex.ru/authorize?response_type=token&client_id=<your app's ClientID>` and copy the token
   ([Yandex's guide](https://yandex.ru/dev/id/doc/en/tokens/debug-token)).
3. Sign in, under a profile name you choose:

```sh
ydisk personal session start          # paste the token when asked, or pipe it on stdin
ydisk personal session status --check
```

Yandex says a token lasts several months and is extended while it is used
([Yandex ID](https://yandex.ru/dev/id/doc/en/concepts/ya-oauth-intro)); when Yandex stops accepting it, sign in
again.

## Copy folders and search them

```sh
ydisk personal folders add /Documents
ydisk personal sync --json
ydisk personal search "quarterly budget" --json
ydisk personal documents show <id> --json
```

Yandex Disk has no change feed, so each `sync` lists the chosen folders again and reads only the files that changed
since the last one (by MD5). A file moved inside the chosen folders keeps its id (Yandex's `resource_id`), its tags
and its notes; a file deleted on the Disk leaves the copy at the end of the pass. A chosen folder renamed or moved on
the Disk is unavailable, and its copies leave the store, until you add it again under its new path. Choose folders
rather than the whole Disk: each sync lists every one of their subfolders.

## Work with the files live

```sh
ydisk personal files list --folder /Documents
ydisk personal files download /Documents/notes.md                  # its text
ydisk personal files download /Documents/plan.pdf --output ./plan.pdf
ydisk personal files upload ./notes.md --folder /Documents
ydisk personal files move /Documents/old.pdf --folder /Archive
ydisk personal files delete /Documents/old.pdf       # to the Disk's trash; files restore brings it back
ydisk personal files publish /Documents/plan.pdf     # a public link: anyone with it can open the file
```

`ydisk personal api list` lists every operation of the Disk API as its own command.

## Permissions

`files.delete` (a delete, and an upload, copy or move with `--replace`) and `files.share` (a public link) ask first
at a terminal. Make any key stricter in the profile's settings, such as `files.delete=deny` for an agent. Downloads
and uploads go to the address Yandex gives, without the token.

More: [usage](docs/usage.md), [commands](docs/commands.md), [settings](docs/configuration.md),
[security](docs/security.md). Design: [docs/dev/DESIGN.md](docs/dev/DESIGN.md).
