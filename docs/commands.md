<!-- Generated from the command tree by pnpm generate. Do not edit. -->

# Commands

Every command, option and exit code, generated from the program itself. For the same list as JSON, run
`ydisk commands --json`.

**The first word is the profile**, a name you choose: `ydisk personal config show`. `YDISK_PROFILE`
does the same for a whole shell session. No profile is assumed: a command that uses an account stops without one and
lists the profiles on this computer.

## Options for every command

| Option | What it does |
|---|---|
| `-V, --version` | output the version number. |
| `-v, --verbose` | more detail in what is shown: -v ids, -vv everything we know. Default: `0`. |
| `--json` | machine-readable output: one JSON value on stdout; --json=id,text keeps only those fields. |
| `--jsonl` | machine-readable output: one JSON object per line, for streaming and jq. |
| `--quiet` | diagnostics off; a failure is still said. |
| `--trace` | the connection's own log lines on stderr — never content. |
| `--debug` | on a failure, its whole record — cause and stack — in place of the short line. |
| `--timeout <duration>` | give up on the whole command after this — 30s, 2m, 500ms. |
| `--offline` | answer from what was recorded and never connect; fails if nothing was. |
| `--no-input` | never prompt or open interactive login; piped input remains available. |
| `--max-input-bytes <bytes>` | maximum buffered input bytes (default: 16777216). |
| `--max-output-bytes <bytes>` | maximum machine output bytes (default: 4194304; 0 disables). |
| `--brief` | found items as reference, title, time, author and excerpt only. |
| `--full` | found items with their whole text and every provider field. |
| `--compact` | one line per item for an agent: reference first, text last, paging and next steps as # lines. |
| `--dry-run` | preview parsed arguments and permissions before running the action. |
| `--yes` | go ahead without the question an ask level puts before a write. |
| `--record` | keep this run even where the config says record false; record_input false leaves the typed words out. |
| `--no-record` | do not keep this run, even if it fails. |

## `ydisk commands`

every command by section; --json prints its contract, one path per call

### `ydisk commands info`

one command contract, or all schemas, error reasons and explicit overrides

```sh
ydisk commands info [path]
```

| Argument | | What it is |
|---|---|---|
| `path` | optional | one command path; without one, export schemas, error reasons and explicit overrides. |

**Example:** `ydisk commands info commands`

## `ydisk session`

keep this profile's Example Comments token in the OS keyring

### `ydisk session start`

sign this profile in: the Example Comments API token is asked hidden or read from stdin, never taken as an argument, checked against the service, and only then kept in the keyring, or in a private file

**Changes something on this computer only.**

```sh
ydisk session start [options]
```

| Option | What it does |
|---|---|
| `--credential-storage <storage>` | where the token is kept: keyring, which falls back to a private file by itself, or file. Default: `keyring`. |

**Example:** `ydisk personal session start`, `ydisk personal session start --credential-storage file`

### `ydisk session status`

show where this profile's token comes from: YDISK_TOKEN, the keyring or a file, never the token; --check asks Example Comments whose token it is

```sh
ydisk session status [options]
```

| Option | What it does |
|---|---|
| `--check` | ask Example Comments whether the token still works, and whose it is. |

**Example:** `ydisk personal session status`, `ydisk personal session status --check --json`

### `ydisk session end`

forget this profile's token on this computer; the token itself stays valid in Example Comments

**Changes something on this computer only.**

```sh
ydisk session end
```

**Example:** `ydisk personal session end`

### `ydisk session list`

list the profiles on this computer and whether each has a token; picks none

```sh
ydisk session list
```

**Example:** `ydisk session list`, `ydisk session list --json`

## `ydisk api`

the raw Example Comments API, one command per operation of its OpenAPI document

### `ydisk api list`

list every Example Comments API operation this CLI offers, without calling Example Comments

```sh
ydisk api list [query]
```

| Argument | | What it is |
|---|---|---|
| `query` | optional | field:value terms that narrow the list — the fields are below. |

**Example:** `ydisk personal api list`, `ydisk personal api list effect:destructive --json=command,path`

### `ydisk api show`

show one operation's parameters and request schema, without calling Example Comments

```sh
ydisk api show <operation>
```

| Argument | | What it is |
|---|---|---|
| `operation` | required | the operation, as api list prints it. |

**Example:** `ydisk personal api show comments-list --json`

### `ydisk api comments-list`

List comments, newest first — read (GET /comments)

```sh
ydisk api comments-list [options]
```

| Option | What it does |
|---|---|
| `--limit <value>` | limit. |
| `--start-cursor <value>` | start_cursor. |
| `--all` | read every page, as the API pages it. |

**Example:** `ydisk personal api comments-list`

### `ydisk api comments-create`

Create a comment — write (POST /comments)

**Changes something in the service.**

```sh
ydisk api comments-create [options]
```

| Option | What it does |
|---|---|
| `--body <json>` | the request body as JSON; - reads it from stdin. |
| `--body-file <path>` | the request body from a JSON file; - is stdin. |

**Example:** `ydisk personal api comments-create`

### `ydisk api comments-get`

Show one comment — read (GET /comments/{comment_id})

```sh
ydisk api comments-get [options]
```

| Option | What it does |
|---|---|
| `--comment-id <value>` | comment_id. |

**Example:** `ydisk personal api comments-get --comment-id <value>`

### `ydisk api comments-update`

Change a comment's text — write (PATCH /comments/{comment_id})

**Changes something in the service.**

```sh
ydisk api comments-update [options]
```

| Option | What it does |
|---|---|
| `--comment-id <value>` | comment_id. |
| `--body <json>` | the request body as JSON; - reads it from stdin. |
| `--body-file <path>` | the request body from a JSON file; - is stdin. |

**Example:** `ydisk personal api comments-update --comment-id <value>`

### `ydisk api comments-delete`

Delete a comment — destructive (DELETE /comments/{comment_id})

**Changes something in the service.**

```sh
ydisk api comments-delete [options]
```

| Option | What it does |
|---|---|
| `--comment-id <value>` | comment_id. |

**Example:** `ydisk personal api comments-delete --comment-id <value>`

## `ydisk comments`

read and write comments in Example Comments, the sample service

### `ydisk comments list`

list the comments in Example Comments, newest first

```sh
ydisk comments list [query] [options]
```

| Argument | | What it is |
|---|---|---|
| `query` | optional | field:value terms that narrow the list — the fields are below. |

| Option | What it does |
|---|---|
| `--limit <n>` | how many to show. |
| `--page <n>` | which page, starting at 1. |
| `--all` | every row, no paging. |

**Returns:** comment — id, text, author, created_at; every field: ydisk commands info comments list

**Example:** `ydisk personal comments list`, `ydisk personal comments list author:u2 --json=id,text`

### `ydisk comments show`

show one comment in Example Comments

```sh
ydisk comments show <id>
```

| Argument | | What it is |
|---|---|---|
| `id` | required | the comment's id, as list prints it. |

**Returns:** comment — id, text, author, created_at; every field: ydisk commands info comments show

**Example:** `ydisk personal comments show c1`, `ydisk personal comments show c1 --json`

### `ydisk comments create`

post a comment in Example Comments

**Changes something in the service.**

```sh
ydisk comments create [options]
```

| Option | What it does |
|---|---|
| `--text <text>` | the comment's text. |

**Example:** `ydisk personal comments create --text "Looks good to me"`, `ydisk personal comments create --text "Looks good to me" --dry-run`

### `ydisk comments update`

change the text of your comment in Example Comments

**Changes something in the service.**

```sh
ydisk comments update <id> [options]
```

| Argument | | What it is |
|---|---|---|
| `id` | required | the comment's id, as list prints it. |

| Option | What it does |
|---|---|
| `--text <text>` | the new text. |

**Example:** `ydisk personal comments update c1 --text "Looks good now"`

## `ydisk doctor`

the state this installation is in, without connecting unless --online

```sh
ydisk doctor [options]
```

| Option | What it does |
|---|---|
| `--online` | also connect once and read the account; sends nothing. |

**Example:** `ydisk doctor`, `ydisk doctor --json`

### `ydisk doctor reports`

problem reports

#### `ydisk doctor reports show`

what a problem report holds; writes nothing

```sh
ydisk doctor reports show
```

**Example:** `ydisk doctor reports show`

#### `ydisk doctor reports create`

write a problem report to a file, and say where to send it

**Changes something on this computer only.**

```sh
ydisk doctor reports create [options]
```

| Option | What it does |
|---|---|
| `--run <id>` | the run the report is about; the newest failed one if not given. |
| `--output <file>` | where to write it; a new file in this directory if not given. |

**Example:** `ydisk doctor reports create --output ./problem-report.json`

## `ydisk skill`

the instructions an agent is given for this tool

### `ydisk skill show`

print SKILL.md — `ydisk skill install` puts it where Claude Code, Codex, Gemini CLI and OpenClaw look for it, and where Hermes does on request; --for prints the copy already there

```sh
ydisk skill show [options]
```

| Option | What it does |
|---|---|
| `--for <agents>` | print the copy installed for these agents instead of this version's. One of: `claude`, `agents`. |

**Example:** `ydisk skill show`

### `ydisk skill install`

write SKILL.md to \~/.claude/skills/yandex-disk-cli/ (Claude Code) and \~/.agents/skills/yandex-disk-cli/ (Codex, Gemini CLI, OpenClaw); --for hermes also has Hermes read \~/.agents/skills, which changes Hermes's own settings, so all leaves it out

**Changes something on this computer only.**

```sh
ydisk skill install [options]
```

| Option | What it does |
|---|---|
| `--for <agents>` | which agents to install for. One of: `claude`, `agents`, `hermes`, `all`. Default: `all`. |

**Example:** `ydisk skill install --for agents`

### `ydisk skill status`

for each place `ydisk skill install` writes to, and for the copy Hermes reads: the path, the version installed there, and whether it is current, stale, missing or unversioned

```sh
ydisk skill status
```

**Example:** `ydisk skill status`, `ydisk skill status --json`

## `ydisk mcp`

serve this profile to an agent over MCP and set it up — `claude mcp add ydisk -- ydisk <profile> mcp serve`

### `ydisk mcp serve`

serve this profile to an agent over MCP, on stdin and stdout — `claude mcp add ydisk -- ydisk <profile> mcp serve`; `ydisk mcp serve --profiles a,b` or `--profiles all` serves those profiles from one server and each tool asks which

**Changes something in the service.**

```sh
ydisk mcp serve [options]
```

| Option | What it does |
|---|---|
| `--permission <key=level>` | make a permission stricter for this server only, like comments.create=deny; it never loosens the profile; repeat for more keys. |
| `--profiles <names\|all>` | serve several profiles from one server instead of one: names, comma-separated, or all for every profile. |
| `--http` | serve over HTTP on 127.0.0.1 for ChatGPT and Claude in the browser, behind your tunnel; the profile's permissions decide. |
| `--port <port>` | the local port for --http (default 8765). |
| `--public-url <url>` | the tunnel's https address the browser apps use, e.g. https://<name>.ts.net or https://<name>.ts.net/tg. |

**Example:** `ydisk personal mcp serve`, `ydisk mcp serve --profiles work,personal`, `ydisk personal mcp serve --http --public-url https://laptop.example.ts.net`

### `ydisk mcp revoke`

forget every login `mcp serve --http` gave a browser app, of this profile or of the server `--profiles` names; each app must log in again

**Changes something on this computer only.**

```sh
ydisk mcp revoke [options]
```

| Option | What it does |
|---|---|
| `--profiles <names\|all>` | serve several profiles from one server instead of one: names, comma-separated, or all for every profile. |

**Example:** `ydisk personal mcp revoke`, `ydisk mcp revoke --profiles all`

### `ydisk mcp server`

start, stop and check `mcp serve --http` in the background; status shows the login code for a browser app

#### `ydisk mcp server start`

start `mcp serve --http` apart from this shell and answer once it listens, with its login code

**Changes something on this computer only.**

```sh
ydisk mcp server start [options]
```

| Option | What it does |
|---|---|
| `--port <port>` | the local port (default 8765). |
| `--public-url <url>` | the tunnel's https address the browser apps use, e.g. https://<name>.ts.net or https://<name>.ts.net/tg. |
| `--permission <key=level>` | make a permission stricter for this server only; repeat for more keys. |
| `--profiles <names\|all>` | the server of several profiles that `mcp serve --profiles` serves: names, comma-separated, or all. |

**Example:** `ydisk personal mcp server start --public-url https://laptop.example.ts.net`

#### `ydisk mcp server stop`

stop `mcp serve --http` — only one that `mcp server start` started

**Changes something on this computer only.**

```sh
ydisk mcp server stop [options]
```

| Option | What it does |
|---|---|
| `--profiles <names\|all>` | the server of several profiles that `mcp serve --profiles` serves: names, comma-separated, or all. |

**Example:** `ydisk personal mcp server stop`

#### `ydisk mcp server status`

whether `mcp serve --http` runs, on which port and address, the login code for a new browser app, and the apps logged in

```sh
ydisk mcp server status [options]
```

| Option | What it does |
|---|---|
| `--profiles <names\|all>` | the server of several profiles that `mcp serve --profiles` serves: names, comma-separated, or all. |

**Example:** `ydisk personal mcp server status --json`

### `ydisk mcp config`

print the mcpServers entry for Claude Desktop, Cursor and others, with full paths; writes nothing

```sh
ydisk mcp config [options]
```

| Option | What it does |
|---|---|
| `--permission <key=level>` | make a permission stricter for this server only, like comments.create=deny; it never loosens the profile; repeat for more keys. |
| `--profiles <names\|all>` | serve several profiles from one server instead of one: names, comma-separated, or all for every profile. |

**Example:** `ydisk personal mcp config`, `ydisk mcp config --profiles all`

### `ydisk mcp add`

add this profile's local MCP server to Codex or Claude Code

**Changes something on this computer only.**

```sh
ydisk mcp add <client> [options]
```

| Argument | | What it is |
|---|---|---|
| `client` | required | codex or claude-code. |

| Option | What it does |
|---|---|
| `--allow-writes` | acknowledge that this profile offers writing tools. |
| `--permission <key=level>` | make a permission stricter for this server only, like comments.create=deny; it never loosens the profile; repeat for more keys. |

**Example:** `ydisk personal mcp add codex --allow-writes`

### `ydisk mcp check`

check this profile's local MCP handshake and tool list

```sh
ydisk mcp check [options]
```

| Option | What it does |
|---|---|
| `--permission <key=level>` | make a permission stricter for this server only, like comments.create=deny; it never loosens the profile; repeat for more keys. |

**Example:** `ydisk personal mcp check`

## `ydisk upgrade`

upgrade ydisk with the package manager that installed it; --check only looks

**Changes something on this computer only.**

```sh
ydisk upgrade [options]
```

| Option | What it does |
|---|---|
| `--check` | say whether a newer version exists, and install nothing. |

**Example:** `ydisk upgrade --check`

## `ydisk config`

the settings in force, and where each one came from

### `ydisk config show`

the profile, the profiles that exist, and each setting with where it came from

```sh
ydisk config show
```

**Example:** `ydisk personal config show`

### `ydisk config set`

save a setting to the configuration file

**Changes something on this computer only.**

```sh
ydisk config set <setting> <value> [options]
```

| Argument | | What it is |
|---|---|---|
| `setting` | required | one of: limit, timeout_ms, color, record, record_input, keep_runs_for_days, keep_successful_runs_for_days, keep_store_runs_for_days, runs_size_limit_mb, permissions, requests_per_minute, search_reranker, embedding_provider, embedding_model, embedding_base_url, embedding_dims, models, update_check, skill_hint, search_stemmers.cyrillic, search_stemmers.latin, owner_languages, crm.<provider>:<account>.links, crm.<provider>:<account>.company-types, crm.<provider>:<account>.scope, crm.<provider>:<account>.unassigned, crm.<provider>:<account>.self, crm.<provider>:<account>.stage-tasks, crm.<provider>:<account>.activities. |
| `value` | required | a number, true or false; for a group tg:work,max:Alice,email:me@x. |

| Option | What it does |
|---|---|
| `--defaults` | change what every profile gets, rather than this profile. |

**Example:** `ydisk personal config set limit 20`

### `ydisk config unset`

remove a setting from the configuration file

**Changes something on this computer only.**

```sh
ydisk config unset <setting> [options]
```

| Argument | | What it is |
|---|---|---|
| `setting` | required | one of: limit, timeout_ms, color, record, record_input, keep_runs_for_days, keep_successful_runs_for_days, keep_store_runs_for_days, runs_size_limit_mb, permissions, requests_per_minute, search_reranker, embedding_provider, embedding_model, embedding_base_url, embedding_dims, models, update_check, skill_hint, search_stemmers.cyrillic, search_stemmers.latin, owner_languages, crm.<provider>:<account>.links, crm.<provider>:<account>.company-types, crm.<provider>:<account>.scope, crm.<provider>:<account>.unassigned, crm.<provider>:<account>.self, crm.<provider>:<account>.stage-tasks, crm.<provider>:<account>.activities. |

| Option | What it does |
|---|---|
| `--defaults` | change what every profile gets, rather than this profile. |

**Example:** `ydisk personal config unset limit`

### `ydisk config migrate`

write each setting the file lacks at its default, keeping yours

**Changes something on this computer only.**

```sh
ydisk config migrate
```

**Example:** `ydisk config migrate`

### `ydisk config repair`

fix broken JSON syntax in the settings file — comments, a missing or extra comma, unquoted keys, single quotes, missing closing brackets at the end — keeping every value, with a backup beside it; refuses anything with more than one reading and changes nothing then

**Changes something on this computer only.**

```sh
ydisk config repair [options]
```

| Option | What it does |
|---|---|
| `--dry-run` | say what it would fix, and change nothing. |

**Example:** `ydisk config repair`, `ydisk config repair --dry-run`

## `ydisk runs`

recorded runs — what this tool did, and when

### `ydisk runs list`

recorded runs, newest first

```sh
ydisk runs list [query] [options]
```

| Argument | | What it is |
|---|---|---|
| `query` | optional | field:value terms that narrow the list — the fields are below. |

| Option | What it does |
|---|---|
| `--limit <n>` | how many to show. |
| `--page <n>` | which page, starting at 1. |

**Returns:** run — run_id, command, started_at, status, cli_version, profile, completed_at, requests, and 23 more; every field: ydisk commands info runs list

**Example:** `ydisk personal runs list --limit 10`

### `ydisk runs show`

one run: what it was, how it ended, and every event it logged

```sh
ydisk runs show <run-id> [options]
```

| Argument | | What it is |
|---|---|---|
| `run-id` | required | an id from `ydisk runs list`. |

| Option | What it does |
|---|---|
| `--problems` | only failed responses, warnings and crashes. |

**Returns:** run details — run_id, command, started_at, status, cli_version, directory, event_count, events, and 22 more; every field: ydisk commands info runs show

**Example:** `ydisk personal runs show run-101`

### `ydisk runs path`

the directory holding one run

```sh
ydisk runs path <run-id>
```

| Argument | | What it is |
|---|---|---|
| `run-id` | required | an id from `ydisk runs list`. |

**Returns:** run location — path; every field: ydisk commands info runs path

**Example:** `ydisk personal runs path run-101`

## Exit codes

Branch on the code, not on the text: the text can change, the code does not.

| Code | When |
|---|---|
| `0` | it worked |
| `2` | `validation_error` |
| `3` | `configuration_error` |
| `4` | `authentication_error` |
| `5` | `permission_error` |
| `6` | `not_found` |
| `7` | `confirmation_required` |
| `8` | `rate_limited` |
| `9` | `timeout` |
| `10` | `network_error` |
| `11` | `provider_error` |
| `12` | `provider_unavailable` |
| `13` | `invalid_response` |
| `14` | `outcome_unknown` |
| `15` | `conflict` |
| `130` | `cancelled` |
| `1` | anything else |
