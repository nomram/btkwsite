-- Quote requests in your own Supabase project (choose an EU region, e.g. Stockholm or Frankfurt).
-- Run once in Supabase -> SQL editor. The website uses the PUBLIC "anon" key, which can only INSERT rows
-- (row-level security); nobody on the internet can read, change or delete them. You read them in the dashboard.
create table if not exists public.quote_requests (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name)    between 1 and 200),
  company     text          check (char_length(company) <= 200),
  email       text not null check (char_length(email)   between 3 and 200),
  phone       text          check (char_length(phone)   <= 60),
  message     text not null check (char_length(message) between 1 and 5000),
  consent     boolean not null check (consent),
  lang        text,
  lang_label  text,
  page        text,
  product     text check (char_length(product) <= 200),
  hole_mm     integer check (hole_mm between 1 and 999),
  -- human check (see src/js/quote-guard.js): proof of work, time spent on the form, reaction game result
  pow_ts      bigint,
  pow_nonce   bigint,
  fill_ms     integer,
  game_hits   integer,
  game_misses integer,
  game_ms     integer
);
-- If the table already exists from an earlier version, add the new columns:
alter table public.quote_requests
  add column if not exists lang_label text, add column if not exists product text, add column if not exists hole_mm integer,
  add column if not exists pow_ts bigint, add column if not exists pow_nonce bigint, add column if not exists fill_ms integer,
  add column if not exists game_hits integer, add column if not exists game_misses integer, add column if not exists game_ms integer;

-- The database checks the human check itself, so a script that talks to the REST endpoint directly cannot skip it:
--   * the proof of work: sha256(email|pow_ts|pow_nonce) must start with four zero hex digits (16 bits) and pow_ts must be recent,
--   * the form cannot have been filled in faster than 6 seconds,
--   * the reaction game must have been completed.
create extension if not exists pgcrypto with schema extensions;
create or replace function public.quote_requests_guard() returns trigger language plpgsql as $
begin
  if new.pow_ts is null or new.pow_nonce is null or abs(extract(epoch from now()) - new.pow_ts) > 3600 then
    raise exception 'human check missing or stale';
  end if;
  if left(encode(extensions.digest(new.email || '|' || new.pow_ts::text || '|' || new.pow_nonce::text, 'sha256'), 'hex'), 4) <> '0000' then
    raise exception 'human check failed';
  end if;
  if coalesce(new.fill_ms, 0) < 6000 or coalesce(new.game_ms, 0) < 1200 then
    raise exception 'too fast';
  end if;
  return new;
end $;
drop trigger if exists quote_requests_guard on public.quote_requests;
create trigger quote_requests_guard before insert on public.quote_requests for each row execute function public.quote_requests_guard();

alter table public.quote_requests enable row level security;

drop policy if exists "anyone can submit a quote request" on public.quote_requests;
create policy "anyone can submit a quote request"
  on public.quote_requests for insert to anon
  with check (true);
-- No select/update/delete policy for anon: they are denied by default.

-- Data minimisation: delete requests older than 12 months (adjust to your privacy policy).
-- Needs the pg_cron extension (Database -> Extensions):
-- select cron.schedule('purge-old-quotes', '0 3 * * *', $$ delete from public.quote_requests where created_at < now() - interval '12 months' $$);
