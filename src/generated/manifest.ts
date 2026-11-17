// GENERATED. DO NOT EDIT.
// Source: spec/ydisk/, checked against provenance.json
// Run: pnpm generate

import type { ApiServer, ManifestOperation, SecurityRequirement, SecurityScheme } from "@wirecat/cli-base/codegen"

export const operations: readonly ManifestOperation[] = [
  {
    id: "listComments",
    command: "comments-list",
    binding: {
      kind: "http",
      method: "GET",
      path: "/comments",
    },
    effect: "read",
    summary: "List comments, newest first",
    tags: ["Comments"],
    pagination: {
      style: "cursor",
      cursor: {
        in: "query",
        name: "start_cursor",
      },
      next: "next_cursor",
      items: "results",
      hasMore: "has_more",
      limit: {
        in: "query",
        name: "limit",
      },
    },
    parameters: [
      {
        name: "limit",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
        },
      },
      {
        name: "start_cursor",
        in: "query",
        required: false,
        schema: {
          type: "string",
        },
      },
    ],
    response: {
      confidence: "contract",
      schema: "CommentList",
    },
  },
  {
    id: "createComment",
    command: "comments-create",
    binding: {
      kind: "http",
      method: "POST",
      path: "/comments",
    },
    effect: "write",
    summary: "Create a comment",
    tags: ["Comments"],
    parameters: [],
    request: {
      required: true,
      confidence: "contract",
      schema: "NewComment",
    },
    response: {
      confidence: "contract",
      schema: "Comment",
    },
  },
  {
    id: "getComment",
    command: "comments-get",
    binding: {
      kind: "http",
      method: "GET",
      path: "/comments/{comment_id}",
    },
    effect: "read",
    summary: "Show one comment",
    tags: ["Comments"],
    parameters: [
      {
        name: "comment_id",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    response: {
      confidence: "contract",
      schema: "Comment",
    },
  },
  {
    id: "updateComment",
    command: "comments-update",
    binding: {
      kind: "http",
      method: "PATCH",
      path: "/comments/{comment_id}",
    },
    effect: "write",
    summary: "Change a comment's text",
    tags: ["Comments"],
    parameters: [
      {
        name: "comment_id",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    request: {
      required: true,
      confidence: "contract",
      schema: "NewComment",
    },
    response: {
      confidence: "contract",
      schema: "Comment",
    },
  },
  {
    id: "deleteComment",
    command: "comments-delete",
    binding: {
      kind: "http",
      method: "DELETE",
      path: "/comments/{comment_id}",
    },
    effect: "destructive",
    summary: "Delete a comment",
    tags: ["Comments"],
    permissions: [
      {
        key: "comments.delete",
      },
    ],
    parameters: [
      {
        name: "comment_id",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
  },
]

export const servers: readonly ApiServer[] = [
  {
    url: "https://comments.example.invalid/v1",
  },
]

export const securitySchemes: Readonly<Record<string, SecurityScheme>> = {
  token: {
    type: "oauth2",
    flows: {
      implicit: {
        authorizationUrl: "https://comments.example.invalid/oauth/authorize",
        scopes: {},
      },
    },
  },
}

export const security: readonly SecurityRequirement[] = [
  {
    token: [],
  },
]
