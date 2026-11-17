# Use it

This page explains how a command is built, and how an agent uses the tool. Read it before your first command.

## The profile comes first

A profile is a name you choose for one account. It is the first word of every command that uses an account:

```sh
ydisk personal config show
```

`YDISK_PROFILE=personal` does the same for one shell session. No profile is ever assumed, not even the only one: a
command without one stops with exit code 2 and lists the profiles on this computer.

## Copy folders and search them

Choose the Disk folders whose text you want to search, then copy them to your computer with `sync`:

```sh
ydisk personal folders browse                # the folders at the top of the Disk
ydisk personal folders add /Documents
ydisk personal sync
ydisk personal search "quarterly budget"
```

`folders browse --folder /Documents` goes one level down. `folders list` shows the folders you chose, and
`folders remove` takes one out. Each `sync` walks the chosen folders again and reads only the files that changed.
The text of PDF, docx, xlsx, CSV, TSV, text and Markdown files is copied; other files are kept by name. Run `sync`
again whenever you want the copy to catch up.

## Work with the files live

The `files` commands reach the Disk directly and need no `sync`:

```sh
ydisk personal files list --folder /Documents
ydisk personal files download /Documents/plan.pdf --json
ydisk personal files move /Documents/old.pdf --folder /Archive
```

`files delete` moves a file to the trash, and `files restore trash:/old.pdf` brings it back. Deleting, replacing and
public links ask first at a terminal; see [settings](configuration.md#permissions).

## Output for scripts

Every command except `mcp serve` on stdin and stdout takes `--json`, and prints one JSON value on stdout. Errors are JSON on stderr, with a code to branch
on. The [command reference](commands.md) lists the codes.

## Agents

`ydisk skill install` puts the tool's skill where Claude Code, Codex, Gemini CLI and OpenClaw look for it.
`ydisk skill install --for hermes` also adds that folder to Hermes Agent's own settings, so a bare `skill install`
leaves Hermes out. `ydisk personal mcp serve` serves the profile's commands over MCP, on stdin and stdout:

```sh
claude mcp add ydisk -- ydisk personal mcp serve
```

The server offers every command, the ones that write included. The profile's permissions decide what runs; see
[settings](configuration.md#permissions).

For ChatGPT and Claude in the browser,
`ydisk personal mcp serve --http --public-url https://laptop.example.ts.net` serves on `127.0.0.1` (port 8765, or
`--port`) behind your own tunnel. A browser app logs in with a one-time code that the command prints;
`ydisk personal mcp revoke` ends every login. `ydisk personal mcp server start` runs the same
server in the background, `mcp server status` shows its port, the login code and the apps logged in, and
`mcp server stop` ends it.
