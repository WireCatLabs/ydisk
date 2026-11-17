// GENERATED. DO NOT EDIT.
// Source: spec/ydisk/, checked against provenance.json
// Run: pnpm generate

import * as v from "valibot"
import type * as T from "./types.js"

export const NewComment: v.GenericSchema<unknown, T.NewComment> = v.looseObject({
  text: v.pipe(v.string(), v.minLength(1)),
})

export const Comment: v.GenericSchema<unknown, T.Comment> = v.looseObject({
  id: v.string(),
  text: v.string(),
  author: v.string(),
  created_at: v.string(),
})

export const CommentList: v.GenericSchema<unknown, T.CommentList> = v.looseObject({
  results: v.array(v.lazy(() => Comment)),
  has_more: v.boolean(),
  next_cursor: v.optional(v.string()),
})

export const schemas = {
  NewComment,
  Comment,
  CommentList,
} as const
