### Added

- **Mirrors: a local folder and a Disk folder kept the same, both ways.** `mirrors add <disk folder> <local folder>`,
  then `mirrors sync`, or `mirrors watch` to keep syncing. A change on one side is copied to the other; a file
  changed on both sides is reported and settled with `--keep local|disk|both`. A deletion goes to the other side's
  trash, the Disk's or `.wirecat-trash/` in the folder, and only when the sync can prove it: a file missing from an
  incomplete listing, or from a folder that was replaced, is never deleted. `mirrors preview` shows the plan, and a run that
  would delete many files waits for `--allow-deletions`. See [mirrors](../docs/mirrors.md).
- `mirrors versions list|restore`: the version a sync replaced or deleted on your computer is kept for 30 days and
  can be put back.

### Fixed

- `folders list` names each chosen folder and gives its Disk path, not only its id.
- `api public-settings-update` no longer reports a write it could not confirm when the Disk answers with no body.

- The token steps suggest an app name like `My laptop`.
