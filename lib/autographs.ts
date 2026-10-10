export type Autograph = {
  id: number | string
  name: string
  message: string
  created_at: string
}

export type AutographListResult =
  | { ok: true; autographs: Autograph[] }
  | { ok: false; error: string }

export type CreateAutographResult = { ok: true } | { ok: false; error: string }
