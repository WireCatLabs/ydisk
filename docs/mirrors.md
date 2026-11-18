# Keep a folder in step with the Disk

A mirror keeps a folder on your computer and a folder on Yandex Disk the same, both ways. Edit a file in your editor,
and the next sync puts it on the Disk. Change it on the Disk, on your phone or in the browser, and the sync brings it
down. Nothing is ever overwritten or deleted without a way back: a deleted file goes to a trash, and the version a
sync replaces on your computer is kept.

Use a mirror when you work on files with local tools, such as an editor, a script or an agent, and want them on the
Disk too, without installing the Yandex Disk app. The files stay as they are: a PDF stays a PDF, a note stays a
Markdown file.

**On this page:**

1. [Connect a folder](#connect-a-folder)
2. [The first sync](#the-first-sync)
3. [Everyday syncs](#everyday-syncs)
4. [A file changed on both sides](#a-file-changed-on-both-sides)
5. [Deleted or only missing](#deleted-or-only-missing)
6. [Where deleted files go](#where-deleted-files-go)
7. [Earlier versions of a file](#earlier-versions-of-a-file)
8. [A folder that was replaced](#a-folder-that-was-replaced)
9. [Keep syncing in the background](#keep-syncing-in-the-background)
10. [What an agent may do](#what-an-agent-may-do)
11. [What is not synced](#what-is-not-synced)

## Connect a folder

Name the Disk folder first, then the local one:

```sh
ydisk personal mirrors add /Notes ~/notes
```

The tool checks that both are folders and saves the pair. It copies nothing yet. `mirrors list` shows your mirrors
with their ids; the commands below take an id when you have more than one mirror.

A mirror belongs to the account the profile was signed in to when you added it. A sync signed in to another account
is refused.

## The first sync

```sh
ydisk personal mirrors sync --dry-run
ydisk personal mirrors sync
```

`--dry-run` lists the Disk folder and shows what the sync would do, and changes nothing. It also shows the
permissions the real run checks.

On the first sync:

- A file that exists on one side only is copied to the other side.
- A file with the same content on both sides is taken as already synced. Nothing is copied.
- A file with different content on both sides is a conflict. Neither copy is changed; see
  [a file changed on both sides](#a-file-changed-on-both-sides).
- Nothing is deleted.

## Everyday syncs

Each sync compares every file three ways: as it is here now, as it is on the Disk now, and as it was at the last
sync. A file changed on one side is copied to the other. A file changed on both sides to the same content is left
as it is. Files are compared by their SHA-256 hash, so a file that was only touched, with the same content, is not
sent again.

`mirrors status` shows which local files the next sync would send or delete on the Disk. It does not ask the Disk,
so it works offline.

## A file changed on both sides

When a file changed here and on the Disk since the last sync, the sync leaves both copies alone and reports the
file under `conflicts`, with the time and size of each side. The sync then ends with an error, so a script notices.
Settle the conflicts with another run:

| Command | What happens |
| --- | --- |
| `mirrors sync --keep local` | Your copy replaces the Disk's. |
| `mirrors sync --keep disk` | The Disk's copy replaces yours. Yours is kept as an [earlier version](#earlier-versions-of-a-file). |
| `mirrors sync --keep both` | The Disk's copy comes down beside yours as `name (conflict 2026-11-19 disk).ext`, and both go to the Disk. |

A file deleted on one side and changed on the other is a conflict too. `--keep` decides it the same way.

## Deleted or only missing

A sync deletes a file on one side only when it can prove you deleted it on the other side. A file counts as deleted
only when all of these hold:

- The last sync saw the file.
- The side where it is missing was read in full. A Disk folder the token cannot read, or more than 10,000 files,
  leaves the listing incomplete.
- That side's folder is still the same folder: the Disk folder has the same id it had at the first sync, and the
  local folder exists, is the same folder and is not empty. An empty local folder may be a drive that is not
  mounted.

A file that is only missing, for any other reason, is reported under `unknown`, and nothing is deleted for it. A
missing Disk folder stops the whole mirror with an error, and nothing is deleted.

A sync that would delete more than 2 files stops before it changes anything when the count is over 50, or over a
quarter of the mirror's files. Check the list with `--dry-run`, then allow the number:

```sh
ydisk personal mirrors sync 1a2b3c4d --allow-deletions 60
```

A file renamed or moved on the Disk is renamed here too: the Disk keeps a file's id across a move. A file renamed
here is sent as a new file, and the old name goes to the Disk's trash.

## Where deleted files go

| Deleted on | The sync moves the other side's copy to | How to get it back |
| --- | --- | --- |
| Your computer | The Disk's trash | `ydisk personal files restore trash:/name.ext`, or the trash in the Disk's web page |
| The Disk | `.wirecat-trash/YYYY-MM-DD/` inside the local folder | Move it back; the next sync sends it |

The Disk refuses the deletion when its copy changed after the sync listed it, so a file someone edited a moment ago
is never deleted: it is reported as a conflict instead. The local trash folder is hidden, so it is never synced.

## Earlier versions of a file

Before a sync replaces or deletes a file on your computer, it keeps the file's content in the profile's state
folder, outside the mirrored folder. It also logs every change it makes, both ways.

```sh
ydisk personal mirrors versions list 1a2b3c4d notes/plan.md
ydisk personal mirrors versions restore 1a2b3c4d notes/plan.md <sha256>
```

`versions list` shows each change, oldest first: when, which way, and the content's hash before (`old`) and after
(`new`). `available` says whether that content is still kept. `versions restore` puts a kept version back into the
local folder; the file there now is kept first. The next sync sends the restored file to the Disk.

A version stays for 30 days. The last version of a file that was deleted stays for good. What a sync replaced on the
Disk is not kept here; the Disk's own trash and history are the place to look for it.

## A folder that was replaced

If the Disk folder was deleted and created again, or the local folder is another folder now (a new drive, a folder
restored from a backup), the sync stops with `confirmation_required` and names `--repin`. When the new folder is the
right one:

```sh
ydisk personal mirrors sync 1a2b3c4d --repin
```

The sync records the new folder and runs as a first sync: identical files are taken, one-sided files are copied, and
different files are conflicts. That run deletes nothing.

## Keep syncing in the background

```sh
ydisk personal mirrors watch
```

`watch` syncs at start, then again a few seconds after you save a file, and when the Disk changed. It asks the Disk
for its revision every 60 seconds (`--every` to change it, at least 10 s): one small request, and the folder is read
again only when the revision moved. Stop it with Ctrl-C, or give it a `--timeout`.

A replace or a deletion asks for `files.delete` first (see below). A watch left running without a terminal cannot
answer, so start it with `--yes`, or allow `files.delete` for the profile.

## What an agent may do

Each sync write checks the command's own permission, `mirrors.sync` or `mirrors.watch`, and also:

- `files.upload` for each file it puts on the Disk;
- `files.delete` for each file it replaces or moves to a trash, on either side. It asks at a terminal by default,
  once per run.

With `files.delete` set to `deny`, a sync still sends and brings down new files, and lists each replace or deletion
it skipped under `errors`. `YDISK_READ_ONLY=1` refuses a sync; `--dry-run` and `mirrors status` still work.

Over MCP an agent may run `mirrors list`, `mirrors status` and `mirrors sync`, but not `--allow-deletions` or
`--repin`. Over MCP nobody can answer a question, so a level at `ask` lets the write through: set `files.delete` to
`deny` for an agent that should not replace or delete files. Adding or removing a mirror, `versions` and `watch` are
for you only. See [connect your agent](mcp.md#decide-what-the-agent-may-change).

## What is not synced

- Hidden files and folders (a name starting with `.`), `node_modules`, and editor leftovers (`~$name`, names
  ending in `~`, `.swp` or `.tmp`), on both sides.
- Symbolic links. A file under a link is never deleted because of it.
- A mirror of more than 10,000 files.
- Empty folders.

`mirrors remove <id>` forgets the pair. Nothing on the Disk or in the local folder changes, and the kept versions
stay. Added again later, the pair starts with a first sync.

Next: [requests to try](recipes.md).
