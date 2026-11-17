// GENERATED. DO NOT EDIT.
// Source: spec/ydisk/, checked against provenance.json
// Run: pnpm generate

import type { SchemaNode } from "@wirecat/cli-base/codegen"

export const definitions: Readonly<Record<string, SchemaNode>> = {
  NewComment: {
    type: "object",
    properties: {
      text: {
        type: "string",
        minLength: 1,
      },
    },
    required: ["text"],
  },
  Comment: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      text: {
        type: "string",
      },
      author: {
        type: "string",
      },
      created_at: {
        type: "string",
      },
    },
    required: ["id", "text", "author", "created_at"],
  },
  CommentList: {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "ref",
          ref: "Comment",
        },
      },
      has_more: {
        type: "boolean",
      },
      next_cursor: {
        type: "string",
      },
    },
    required: ["results", "has_more"],
  },
}
