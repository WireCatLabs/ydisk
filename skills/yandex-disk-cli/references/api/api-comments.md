<!-- Generated from the API manifest and the command tree by pnpm generate. Do not edit. -->

# Example Comments API: Comments

## `ydisk api comments-create [options]`

- What: Create a comment
- Call: `POST /comments`, effect: write
- Body: `NewComment`, required

| Flag | Required | What |
|---|---|---|
| `--body <json>` | no | the request body as JSON; - reads it from stdin |
| `--body-file <path>` | no | the request body from a JSON file; - is stdin |

## `ydisk api comments-delete [options]`

- What: Delete a comment
- Call: `DELETE /comments/{comment_id}`, effect: destructive
- Permission keys: `comments.delete`

| Flag | Required | What |
|---|---|---|
| `--comment-id <value>` | yes | comment\_id |

## `ydisk api comments-get [options]`

- What: Show one comment
- Call: `GET /comments/{comment_id}`, effect: read

| Flag | Required | What |
|---|---|---|
| `--comment-id <value>` | yes | comment\_id |

## `ydisk api comments-list [options]`

- What: List comments, newest first
- Call: `GET /comments`, effect: read
- Pages: cursor: send `start_cursor` (query), read the next one from `next_cursor`; items in `results`; `has_more` is false on the last page; page size in `limit` (query)

| Flag | Required | What |
|---|---|---|
| `--limit <value>` | no | limit |
| `--start-cursor <value>` | no | start\_cursor |
| `--all` | no | read every page, as the API pages it |

## `ydisk api comments-update [options]`

- What: Change a comment's text
- Call: `PATCH /comments/{comment_id}`, effect: write
- Body: `NewComment`, required

| Flag | Required | What |
|---|---|---|
| `--comment-id <value>` | yes | comment\_id |
| `--body <json>` | no | the request body as JSON; - reads it from stdin |
| `--body-file <path>` | no | the request body from a JSON file; - is stdin |
