-- Guestbook table for the wedding invitation.
-- Run this in the Supabase SQL editor, then set:
--   NEXT_PUBLIC_SUPABASE_URL
--   NEXT_PUBLIC_SUPABASE_ANON_KEY

create table if not exists public."Autographs" (
  id bigint generated always as identity primary key,
  name text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint autographs_name_length check (char_length(btrim(name)) between 1 and 80),
  constraint autographs_message_length check (char_length(btrim(message)) between 1 and 600)
);

create index if not exists autographs_created_at_idx
  on public."Autographs" (created_at desc);

alter table public."Autographs" enable row level security;

grant select, insert on table public."Autographs" to anon, authenticated;

drop policy if exists "Public read autographs" on public."Autographs";
create policy "Public read autographs"
  on public."Autographs"
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public insert autographs" on public."Autographs";
create policy "Public insert autographs"
  on public."Autographs"
  for insert
  to anon, authenticated
  with check (
    char_length(btrim(name)) between 1 and 80
    and char_length(btrim(message)) between 1 and 600
  );
