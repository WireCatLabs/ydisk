### Added

- **Mirror the whole Disk.** `mirrors add / ~/YandexDisk` keeps the whole Disk in a folder of its own, read with
  Yandex's flat file list, up to 100,000 files. See [the whole Disk](../docs/mirrors.md#the-whole-disk).
- **Leave folders out of a mirror.** `mirrors add --ignore <path>` (repeated, a path or a glob) and
  `mirrors update <id> --ignore <path>…` adds to the list, and `--clear` empties it first. An ignored path is never deleted on either side: ignoring one
  trashes nothing, and one no longer ignored syncs as a new folder. See [leave folders out](../docs/mirrors.md#leave-folders-out).
- **A sync checks free space first.** It stops with `mirror.no-space` when its downloads and the versions it keeps
  would leave too little free: a tenth of what it writes, at least 100 MB and at most 1 GB.

### Changed — may break callers

- **Many changes at once always wait for your approval.** A sync stops before more than 10 deletions or more than 50
  replacements of existing files, however big the mirror (40 deletions out of 1,000 files used to pass). The error
  names the counts and the exact command; `--replace` joins `--allow-deletions`, both for you only, never
  for an agent over MCP, and both need the mirror's id when you have more than one. A stopped mirror no longer holds
  up the others, and `mirrors watch` reports the stop at every cycle that syncs the mirror. See
  [many changes at once](../docs/mirrors.md#many-changes-at-once).
- **A deletion on a busy Disk is still proven.** A file missing from the listing is deleted here only once the Disk,
  asked for it by its path after the listing, has nothing there. The listing is no longer read up to three times
  while the Disk changes, so a phone uploading photos no longer blocks every deletion.
- **The home folder is never mirrored**, even when the CLI's own folders are moved out of it.
- Requires `@wirecat/cli-core` 0.711.0.
