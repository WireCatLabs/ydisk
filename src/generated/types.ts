// GENERATED. DO NOT EDIT.
// Source: spec/ydisk/, checked against provenance.json
// Run: pnpm generate

export type NewComment = {
  text: string
}

export type Comment = {
  id: string
  text: string
  author: string
  created_at: string
}

export type CommentList = {
  results: Array<Comment>
  has_more: boolean
  next_cursor?: string
}
