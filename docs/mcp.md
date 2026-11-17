# Connect your agent

Give your AI agent your Yandex Disk, so it finds a document, quotes it and files it for you on request. An agent with
a terminal runs `ydisk` itself after you install the tool's skill. An app without a terminal, such as Claude Desktop
or Cursor, reaches the same commands through MCP, the Model Context Protocol that AI apps use to call tools. You
decide what the agent may change.

**On this page:**

1. [Agents with a terminal](#agents-with-a-terminal)
2. [Claude Code and Codex over MCP](#claude-code-and-codex-over-mcp)
3. [Claude Desktop, Cursor and other MCP apps](#claude-desktop-cursor-and-other-mcp-apps)
4. [ChatGPT and Claude in the browser](#chatgpt-and-claude-in-the-browser)
5. [Decide what the agent may change](#decide-what-the-agent-may-change)

## Agents with a terminal

Claude Code, Codex, Gemini CLI, OpenClaw and other agents that run commands need only the skill: a short file that
teaches the agent the tool's commands and rules.

```sh
ydisk skill install
```

It puts the skill where Claude Code (`~/.claude/skills/`) and Codex, Gemini CLI and OpenClaw (`~/.agents/skills/`)
look for it. `ydisk skill install --for hermes` adds that folder to Hermes Agent's own settings too, which a plain
`skill install` leaves alone. Run it again after an update. `ydisk skill status` says whether the installed skill
matches this version.

Then ask in plain words, and name the profile:

```text prompt
Use ydisk CLI with profile personal. What did I upload to /Documents/Invoices this month?
List the files with their dates. Do not change anything.
```

## Claude Code and Codex over MCP

To give Claude Code or Codex the tool as an MCP server instead, add it with one command:

```sh
ydisk personal mcp add claude-code --allow-writes
ydisk personal mcp add codex --allow-writes
```

`--allow-writes` confirms that you know the server offers the commands that change the Disk. The profile's
permissions still decide what runs. See [below](#decide-what-the-agent-may-change).

## Claude Desktop, Cursor and other MCP apps

```sh
ydisk personal mcp config
```

It prints the `mcpServers` entry with full paths. Paste it into the app's MCP settings, then restart the app. Where
each app keeps its settings is on the [agents page](https://wirecat.dev/en/docs/agents). Print the entry again after
you switch or update Node.js, because it names one Node.js path.

`ydisk personal mcp check` starts the server the way an app would and lists the tools it offers. Run it when an app
shows no `ydisk` tools.

One server can serve several profiles: `ydisk mcp config --profiles personal,work`. Each tool then asks which
profile to use.

## ChatGPT and Claude in the browser

A browser app cannot start a program on your computer, so `ydisk` serves MCP over HTTP on your computer, and your own
tunnel, such as Tailscale Funnel or Cloudflare Tunnel, gives it an `https` address:

```sh
ydisk personal mcp server start --public-url https://laptop.example.ts.net
ydisk personal mcp server status
```

The address above is an example. Use your tunnel's. The server listens on `127.0.0.1`, port 8765 (`--port` changes
it), and runs in the background until `ydisk personal mcp server stop`. A browser app logs in with a one-time code
that `server start` and `server status` print. `ydisk personal mcp revoke` ends every login. Setting up the tunnel and
the app is on the [browser apps page](https://wirecat.dev/en/docs/browser-apps).

## Decide what the agent may change

The MCP server offers every command, the ones that change the Disk included. At a terminal the tool asks before a
delete, an overwrite and a public link, but over MCP there is no one to ask, so those run. Choose one of these for an
agent:

- **Read only.** `YDISK_READ_ONLY=1` in the server's environment refuses every change.
- **No deleting and no public links.** Set the two permissions for the profile:

  ```sh
  ydisk personal config set permissions.files.delete deny
  ydisk personal config set permissions.files.share deny
  ```

- **Stricter for one server only.** `--permission` on `mcp serve`, `mcp add`, `mcp config` or `mcp server start`
  makes a permission stricter for that server, never looser:
  `ydisk personal mcp add claude-code --allow-writes --permission files.delete=deny`.

Over MCP an agent reads a file's text with `files download` but cannot save a file to a path on your computer. Every
permission key is in [settings](configuration.md#permissions), and what reaches your disk and the network is in
[security](security.md).

Next: [requests to try](recipes.md).
