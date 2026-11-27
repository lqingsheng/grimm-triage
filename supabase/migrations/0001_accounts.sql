-- Grimm Triage: optional accounts (task 22).
--
-- Run once in the Supabase dashboard: SQL Editor > New query > paste this file > Run. It runs as
-- the default `postgres` role, which owns the functions below (delete_account() needs that role to
-- delete from auth.users). Everything is in one transaction: if any statement or the self-test at
-- the end fails, nothing is created. Safe to run again.
--
-- What the browser can do (publishable key + the player's own access token):
--   anon (signed out):  call leaderboard().
--   authenticated:      read, create and rename its own profile; read and insert its own results;
--                       call my_progress(), leaderboard() and delete_account().
-- Row level security is enabled on every table. Results cannot be updated or deleted by players
-- (except all at once through delete_account()).
--
-- The numbers below match the game: 15 patients per night (NIGHT_SIZE in src/night.js) and 100
-- points per patient (MAX_POINTS in src/shift.js), so the best night is 1500
-- (NIGHT_MAX_SCORE in src/accounts.js). test/accounts.test.js checks that they agree.

begin;

-- ---------------------------------------------------------------------------------------------
-- Display names: 2 to 20 characters, letters (any script), digits, spaces and hyphens, trimmed.
-- The same rule as validateDisplayName() in src/accounts.js.
create or replace function public.valid_display_name(name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select name is not null
     and name = btrim(name)
     and char_length(name) between 2 and 20
     and name ~ '^[[:alpha:][:digit:] -]+$'
$$;

-- ---------------------------------------------------------------------------------------------
-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null constraint profiles_display_name_valid check (public.valid_display_name(display_name)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.results (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  score integer not null,
  correct smallint not null,
  under_triage smallint not null,
  over_triage smallint not null,
  storyline boolean not null default false,
  played_at timestamptz not null,
  created_at timestamptz not null default now(),
  -- Score between 0 and the best possible night (15 patients x 100 points).
  constraint results_score_range check (score between 0 and 1500),
  constraint results_counts_range check (
    correct between 0 and 15 and under_triage between 0 and 15 and over_triage between 0 and 15
  ),
  -- Only full nights are saved: every one of the 15 patients is correct, under- or over-triaged.
  constraint results_full_night check (correct + under_triage + over_triage = 15),
  -- scoreGuess() in src/triage.js gives 100 (exact), 50 (over by 1), 25 (under by 1) or 0, so a
  -- score is a multiple of 25, at least 100 per correct answer and at most that plus 50 per
  -- over-triage and 25 per under-triage.
  constraint results_score_step check (score % 25 = 0),
  constraint results_score_consistent check (
    score >= 100 * correct and score <= 100 * correct + 50 * over_triage + 25 * under_triage
  )
);

-- Leaderboard: best score per player. Daily limit: a player's rows of the last 24 hours.
create index if not exists results_user_score_idx on public.results (user_id, score desc);
create index if not exists results_user_created_idx on public.results (user_id, created_at desc);

-- ---------------------------------------------------------------------------------------------
-- Triggers
create or replace function public.profiles_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_before_update on public.profiles;
create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.profiles_before_update();

-- At most 30 saved results per player in any 24 hours, created_at set by the server, and a
-- played_at that is not in the future (5 minutes of clock skew allowed) or more than 30 days old.
create or replace function public.results_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.created_at := now();
  if new.played_at > now() + interval '5 minutes' or new.played_at < now() - interval '30 days' then
    raise exception 'played_at_out_of_range' using errcode = '23514';
  end if;
  -- One insert at a time per player, so two tabs cannot both slip under the limit.
  perform pg_advisory_xact_lock(hashtextextended('grimm-triage-results:' || new.user_id::text, 0));
  if (
    select count(*) from public.results r
    where r.user_id = new.user_id and r.created_at > now() - interval '24 hours'
  ) >= 30 then
    raise exception 'daily_result_limit' using errcode = 'P0001', detail = 'At most 30 saved results per player per day.';
  end if;
  return new;
end;
$$;

drop trigger if exists results_before_insert on public.results;
create trigger results_before_insert
  before insert on public.results
  for each row execute function public.results_before_insert();

-- ---------------------------------------------------------------------------------------------
-- Row level security: players can read and write only their own rows.
alter table public.profiles enable row level security;
alter table public.results enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles: create own" on public.profiles;
create policy "profiles: create own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles: rename own" on public.profiles;
create policy "profiles: rename own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "results: read own" on public.results;
create policy "results: read own" on public.results
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "results: insert own" on public.results;
create policy "results: insert own" on public.results
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Table privileges on top of RLS: signed-out visitors get nothing; players may only write the
-- columns the game sends (user_id always comes from the default auth.uid()).
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.results from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, display_name) on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;
grant select on table public.results to authenticated;
grant insert (score, correct, under_triage, over_triage, storyline, played_at) on table public.results to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Functions the app calls (POST /rest/v1/rpc/<name>)

-- The caller's own progress. Security invoker: RLS applies as well as the explicit filter.
create or replace function public.my_progress()
returns table (
  nights_played bigint,
  best_score integer,
  average_score numeric,
  under_rate numeric,
  recent_scores integer[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    count(*),
    max(r.score),
    round(avg(r.score), 1),
    sum(r.under_triage)::numeric / nullif(sum(r.correct + r.under_triage + r.over_triage), 0),
    coalesce((
      select array_agg(x.score order by x.played_at)
      from (
        select r2.score, r2.played_at from public.results r2
        where r2.user_id = (select auth.uid())
        order by r2.played_at desc
        limit 10
      ) x
    ), '{}')
  from public.results r
  where r.user_id = (select auth.uid());
$$;

-- Top 50 players by best single-night score, plus the caller's own row when outside the top 50.
-- Exposes only rank, display name, best score, nights played and whether the row is the caller's.
-- Security definer so it can rank everyone without opening the tables to other players.
create or replace function public.leaderboard()
returns table (
  rank bigint,
  display_name text,
  best_score integer,
  nights_played bigint,
  is_me boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with stats as (
    select r.user_id, max(r.score) as best_score, count(*) as nights_played
    from public.results r
    group by r.user_id
  ),
  ranked as (
    select
      rank() over (order by s.best_score desc) as rank,
      row_number() over (order by s.best_score desc, s.nights_played desc, p.created_at, p.id) as pos,
      p.display_name,
      s.best_score,
      s.nights_played,
      coalesce(s.user_id = auth.uid(), false) as is_me
    from stats s
    join public.profiles p on p.id = s.user_id
  )
  select k.rank, k.display_name, k.best_score, k.nights_played, k.is_me
  from ranked k
  where k.pos <= 50 or k.is_me
  order by k.pos;
$$;

-- Deletes the caller's results, profile and auth user. Only ever the caller: the id comes from
-- auth.uid(), never from an argument.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  delete from public.results where user_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

-- Function privileges. Supabase grants EXECUTE on new public functions to anon and authenticated
-- by default, so revoke first and grant only what each role needs.
revoke all on function public.valid_display_name(text) from public, anon, authenticated;
revoke all on function public.profiles_before_update() from public, anon, authenticated;
revoke all on function public.results_before_insert() from public, anon, authenticated;
revoke all on function public.my_progress() from public, anon, authenticated;
revoke all on function public.leaderboard() from public, anon, authenticated;
revoke all on function public.delete_account() from public, anon, authenticated;
-- Postgres checks EXECUTE for the current user when a CHECK constraint calls a function, so the
-- profiles_display_name_valid constraint needs this for a player's profile insert and rename.
-- It is immutable and only answers whether a name is allowed.
grant execute on function public.valid_display_name(text) to anon, authenticated;
grant execute on function public.my_progress() to authenticated;
grant execute on function public.leaderboard() to anon, authenticated;
grant execute on function public.delete_account() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Self-test. If the database locale did not treat Chinese characters as letters, Chinese display
-- names would be rejected; this stops the migration (and rolls everything back) instead.
do $$
begin
  assert public.valid_display_name('Night Nurse 4821'), 'valid_display_name rejects a Latin name';
  assert public.valid_display_name('夜班护士 4821'), 'valid_display_name rejects a Chinese name (database locale)';
  assert public.valid_display_name('Zoë-Ann'), 'valid_display_name rejects an accented name';
  assert not public.valid_display_name(' Night Nurse'), 'valid_display_name accepts untrimmed text';
  assert not public.valid_display_name('a'), 'valid_display_name accepts 1 character';
  assert not public.valid_display_name(repeat('a', 21)), 'valid_display_name accepts 21 characters';
  assert not public.valid_display_name('<script>'), 'valid_display_name accepts markup';
  assert not public.valid_display_name('Night_Nurse'), 'valid_display_name accepts an underscore';
  assert not public.valid_display_name('👻👻'), 'valid_display_name accepts emoji';
end;
$$;

commit;
