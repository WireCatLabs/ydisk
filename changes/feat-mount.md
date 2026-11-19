### Added

- **`ydisk <profile> files serve [path]` shows a Disk folder, or the whole Disk, as a read-only folder on this
  computer.** It serves the folder over WebDAV on 127.0.0.1 behind a random address made for each run, and the
  system's own client mounts it: `gio mount` on Linux, Finder on macOS, `net use` on Windows. Nothing can write,
  rename or delete on the Disk through it. It runs until Ctrl-C, is never offered to agents over MCP, and is refused
  where `files.download` is denied ([mount](../docs/mount.md)).
