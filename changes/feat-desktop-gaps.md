### Added

- `ydisk store info` shows the shared store's file, size, format and row counts, so WireCat Desktop can say whether
  Yandex Disk reads it.
- `ydisk <profile> account remove --keep-data|--delete-data` signs the profile out and forgets it on this computer. It
  keeps or deletes the chosen folders and the synced files.
- `folders browse` gives each folder a `kind` and a `has_children`. Yandex gives no child count, so it looks inside each
  folder, one request each, when the level has 20 folders or fewer; with more, `has_children` is `null`.

### Fixed

- The help and the error of `--cursor` in `folders browse` and `files list` name `page.next_cursor`, the key the answer
  has, not `page.next`.
