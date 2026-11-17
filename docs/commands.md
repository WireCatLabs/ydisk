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

the raw Yandex Disk API, one command per operation of its OpenAPI document

### `ydisk api list`

list every Yandex Disk API operation this CLI offers, without calling Yandex Disk

```sh
ydisk api list [query]
```

| Argument | | What it is |
|---|---|---|
| `query` | optional | field:value terms that narrow the list — the fields are below. |

**Example:** `ydisk personal api list`, `ydisk personal api list effect:destructive --json=command,path`

### `ydisk api show`

show one operation's parameters and request schema, without calling Yandex Disk

```sh
ydisk api show <operation>
```

| Argument | | What it is |
|---|---|---|
| `operation` | required | the operation, as api list prints it. |

**Example:** `ydisk personal api show disk-get --json`

### `ydisk api disk-get`

Получить метаинформацию о диске пользователя — read (GET /v1/disk)

```sh
ydisk api disk-get [options]
```

| Option | What it does |
|---|---|
| `--extra-fields <value>` | Дополнительные поля, которые нужно вернуть. |
| `--fields <value>` | Список возвращаемых атрибутов. |

**Example:** `ydisk personal api disk-get`

### `ydisk api resources-list`

Получить метаинформацию о файле или каталоге — read (GET /v1/disk/resources)

```sh
ydisk api resources-list [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к ресурсу. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--limit <value>` | Количество выводимых вложенных ресурсов. |
| `--offset <value>` | Смещение от начала списка вложенных ресурсов. |
| `--preview-crop <value>` | Разрешить обрезку превью. |
| `--preview-size <value>` | Размер превью. |
| `--sort <value>` | Поле для сортировки вложенных ресурсов. |
| `--all` | read every page, as the API pages it. |

**Example:** `ydisk personal api resources-list --path <value>`

### `ydisk api resources-create`

Создать каталог — write (PUT /v1/disk/resources)

**Changes something in the service.**

```sh
ydisk api resources-create [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к создаваемой папке. |
| `--fields <value>` | Список возвращаемых атрибутов. |

**Example:** `ydisk personal api resources-create --path <value>`

### `ydisk api resources-update`

Обновить пользовательские данные ресурса — write (PATCH /v1/disk/resources)

**Changes something in the service.**

```sh
ydisk api resources-update [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к обновляемому ресурсу. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--body <json>` | the request body as JSON; - reads it from stdin. |
| `--body-file <path>` | the request body from a JSON file; - is stdin. |

**Example:** `ydisk personal api resources-update --path <value>`

### `ydisk api resources-delete`

Удалить файл или папку — destructive (DELETE /v1/disk/resources)

**Changes something in the service.**

```sh
ydisk api resources-delete [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к файлу или папке. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--force-async <value>` | Выполнить асинхронно. |
| `--md5 <value>` | md5 удаляемого файла. |
| `--permanently <value>` | Удалить ресурс не помещая в Корзину. |

**Example:** `ydisk personal api resources-delete --path <value>`

### `ydisk api resources-copy`

Создать копию файла или папки — write (POST /v1/disk/resources/copy)

**Changes something in the service.**

```sh
ydisk api resources-copy [options]
```

| Option | What it does |
|---|---|
| `--from <value>` | Путь к копируемому ресурсу. |
| `--path <value>` | Путь к создаваемому ресурсу. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--force-async <value>` | Выполнить асинхронно. |
| `--overwrite <value>` | Перезаписать существующий ресурс. |

**Example:** `ydisk personal api resources-copy --from <value> --path <value>`

### `ydisk api resources-download-link`

Получить ссылку на скачивание файла — read (GET /v1/disk/resources/download)

```sh
ydisk api resources-download-link [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к ресурсу. |
| `--fields <value>` | Список возвращаемых атрибутов. |

**Example:** `ydisk personal api resources-download-link --path <value>`

### `ydisk api resources-files-list`

Получить список файлов упорядоченный по имени — read (GET /v1/disk/resources/files)

```sh
ydisk api resources-files-list [options]
```

| Option | What it does |
|---|---|
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--limit <value>` | Количество последних загруженных файлов в ответе. |
| `--media-type <value>` | Фильтр по медиа типу. Несколько типов перечисляются через запятую. |
| `--offset <value>` | Смещение от начала списка вложенных ресурсов. |
| `--preview-crop <value>` | Разрешить обрезку превью. |
| `--preview-size <value>` | Размер превью. |
| `--sort <value>` | Поле для сортировки ресурсов. |
| `--all` | read every page, as the API pages it. |

**Example:** `ydisk personal api resources-files-list`

### `ydisk api resources-last-uploaded-list`

Получить список файлов упорядоченный по дате загрузки — read (GET /v1/disk/resources/last-uploaded)

```sh
ydisk api resources-last-uploaded-list [options]
```

| Option | What it does |
|---|---|
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--limit <value>` | Количество последних загруженных файлов в ответе. |
| `--media-type <value>` | Фильтр по медиа типу. Несколько типов перечисляются через запятую. |
| `--preview-crop <value>` | Разрешить обрезку превью. |
| `--preview-size <value>` | Размер превью. |

**Example:** `ydisk personal api resources-last-uploaded-list`

### `ydisk api resources-move`

Переместить файл или папку — write (POST /v1/disk/resources/move)

**Changes something in the service.**

```sh
ydisk api resources-move [options]
```

| Option | What it does |
|---|---|
| `--from <value>` | Путь к перемещаемому ресурсу. |
| `--path <value>` | Путь к создаваемому ресурсу. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--force-async <value>` | Выполнить асинхронно. |
| `--overwrite <value>` | Перезаписать существующий ресурс. |

**Example:** `ydisk personal api resources-move --from <value> --path <value>`

### `ydisk api resources-public-list`

Получить список опубликованных ресурсов — read (GET /v1/disk/resources/public)

```sh
ydisk api resources-public-list [options]
```

| Option | What it does |
|---|---|
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--limit <value>` | Количество выводимых ресурсов. |
| `--offset <value>` | Смещение от начала списка ресурсов. |
| `--preview-crop <value>` | Разрешить обрезку превью. |
| `--preview-size <value>` | Размер превью. |
| `--type <value>` | Фильтр по типам ресурсов. |
| `--all` | read every page, as the API pages it. |

**Example:** `ydisk personal api resources-public-list`

### `ydisk api resources-publish`

Опубликовать ресурс — write (PUT /v1/disk/resources/publish)

**Changes something in the service.**

```sh
ydisk api resources-publish [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к публикуемому ресурсу. |
| `--allow-address-access <value>` | Возможность клиента обрабатывать ответы от адресного доступа. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--body <json>` | the request body as JSON; - reads it from stdin. |
| `--body-file <path>` | the request body from a JSON file; - is stdin. |

**Example:** `ydisk personal api resources-publish --path <value>`

### `ydisk api resources-unpublish`

Отменить публикацию ресурса — write (PUT /v1/disk/resources/unpublish)

**Changes something in the service.**

```sh
ydisk api resources-unpublish [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к ресурсу. |
| `--fields <value>` | Список возвращаемых атрибутов. |

**Example:** `ydisk personal api resources-unpublish --path <value>`

### `ydisk api resources-upload-link`

Получить ссылку для загрузки файла — read (GET /v1/disk/resources/upload)

```sh
ydisk api resources-upload-link [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к загружаемому файлу на Диске. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--overwrite <value>` | Перезаписать существующий файл. |

**Example:** `ydisk personal api resources-upload-link --path <value>`

### `ydisk api resources-upload-url`

Загрузить файл в Диск по URL — write (POST /v1/disk/resources/upload)

**Changes something in the service.**

```sh
ydisk api resources-upload-url [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь, куда будет помещён ресурс. |
| `--url <value>` | URL внешнего ресурса, который следует загрузить. |
| `--disable-redirects <value>` | Запретить делать редиректы. |
| `--fields <value>` | Список возвращаемых атрибутов. |

**Example:** `ydisk personal api resources-upload-url --path <value> --url <value>`

### `ydisk api public-resources-get`

Получить метаинформацию о публичном файле или каталоге — read (GET /v1/disk/public/resources)

```sh
ydisk api public-resources-get [options]
```

| Option | What it does |
|---|---|
| `--public-key <value>` | Ключ или публичный URL ресурса. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--limit <value>` | Количество выводимых вложенных ресурсов. |
| `--offset <value>` | Смещение от начала списка вложенных ресурсов. |
| `--path <value>` | Путь к ресурсу в публичной папке. |
| `--preview-crop <value>` | Разрешить обрезку превью. |
| `--preview-size <value>` | Размер превью. |
| `--sort <value>` | Поле для сортировки вложенных ресурсов. |
| `--all` | read every page, as the API pages it. |

**Example:** `ydisk personal api public-resources-get --public-key <value>`

### `ydisk api public-resources-download-link`

Получить ссылку на скачивание публичного ресурса — read (GET /v1/disk/public/resources/download)

```sh
ydisk api public-resources-download-link [options]
```

| Option | What it does |
|---|---|
| `--public-key <value>` | Ключ или публичный URL ресурса. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--path <value>` | Путь к ресурсу в публичной папке. |

**Example:** `ydisk personal api public-resources-download-link --public-key <value>`

### `ydisk api public-settings-update`

Обновить настройки публичных ссылок — write (PATCH /v1/disk/public/resources/public-settings)

**Changes something in the service.**

```sh
ydisk api public-settings-update [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к ресурсу. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--body <json>` | the request body as JSON; - reads it from stdin. |
| `--body-file <path>` | the request body from a JSON file; - is stdin. |

**Example:** `ydisk personal api public-settings-update --path <value>`

### `ydisk api public-resources-save-to-disk`

Сохранить публичный ресурс в папку Загрузки — write (POST /v1/disk/public/resources/save-to-disk)

**Changes something in the service.**

```sh
ydisk api public-resources-save-to-disk [options]
```

| Option | What it does |
|---|---|
| `--public-key <value>` | Ключ или публичный URL ресурса. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--force-async <value>` | Выполнить асинхронно. |
| `--name <value>` | Имя, под которым ресурс будет сохранён в папке. |
| `--path <value>` | Путь к копируемому ресурсу в публичной папке. |
| `--save-path <value>` | Путь к папке, в которую будет сохранен ресурс. По умолчанию «Загрузки». |

**Example:** `ydisk personal api public-resources-save-to-disk --public-key <value>`

### `ydisk api trash-resources-list`

Получить содержимое Корзины — read (GET /v1/disk/trash/resources)

```sh
ydisk api trash-resources-list [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к ресурсу в Корзине. |
| `--apply-photoslice-filter <value>` | Требуется ли отдавать только фотосрез. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--limit <value>` | Количество выводимых вложенных ресурсов. |
| `--offset <value>` | Смещение от начала списка вложенных ресурсов. |
| `--preview-crop <value>` | Разрешить обрезку превью. |
| `--preview-size <value>` | Размер превью. |
| `--sort <value>` | Поле для сортировки вложенных ресурсов. |
| `--all` | read every page, as the API pages it. |

**Example:** `ydisk personal api trash-resources-list --path <value>`

### `ydisk api trash-resources-delete`

Очистить Корзину — destructive (DELETE /v1/disk/trash/resources)

**Changes something in the service.**

```sh
ydisk api trash-resources-delete [options]
```

| Option | What it does |
|---|---|
| `--apply-photoslice-filter <value>` | Требуется ли удалять только файлы фотосреза. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--force-async <value>` | Выполнить асинхронно. |
| `--path <value>` | Путь к ресурсу в Корзине. |

**Example:** `ydisk personal api trash-resources-delete`

### `ydisk api trash-resources-restore`

Восстановить ресурс из Корзины — write (PUT /v1/disk/trash/resources/restore)

**Changes something in the service.**

```sh
ydisk api trash-resources-restore [options]
```

| Option | What it does |
|---|---|
| `--path <value>` | Путь к ресурсу в Корзине. |
| `--fields <value>` | Список возвращаемых атрибутов. |
| `--force-async <value>` | Выполнить асинхронно. |
| `--name <value>` | Имя, под которым будет восстановлен ресурс. |
| `--overwrite <value>` | Перезаписать существующий ресурс восстанавливаемым. |

**Example:** `ydisk personal api trash-resources-restore --path <value>`

### `ydisk api operations-get`

Получить статус асинхронной операции — read (GET /v1/disk/operations/{operation_id})

```sh
ydisk api operations-get [options]
```

| Option | What it does |
|---|---|
| `--operation-id <value>` | Идентификатор операции. |
| `--fields <value>` | Список возвращаемых атрибутов. |

**Example:** `ydisk personal api operations-get --operation-id <value>`

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
ydisk skill show [name] [options]
```

| Argument | | What it is |
|---|---|---|
| `name` | optional | a part of this skill, or a skill shipped for a task: api-comments, api. |

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
