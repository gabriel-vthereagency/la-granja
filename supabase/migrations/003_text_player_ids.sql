-- Migration: Change players.id from UUID to TEXT
-- WARNING: Run this ONLY on fresh databases or before importing player data
-- This will DROP all player-related data!

-- Step 1: Drop tables that reference players (in order)
drop table if exists live_tournament_players cascade;
drop table if exists player_aliases cascade;
drop table if exists offline_event_results cascade;
drop table if exists event_results cascade;
drop table if exists players cascade;

-- Step 2: Recreate players with TEXT id
create table players (
  id text primary key,
  name text not null,
  nickname text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Step 3: Recreate event_results with TEXT player_id
create table event_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references event_nights(id) on delete cascade,
  player_id text references players(id) on delete cascade,
  position integer not null,
  rebuys integer default 0,
  points integer default 0,
  prize numeric(10,2) default 0,
  created_at timestamptz default now(),
  unique (event_id, player_id)
);

-- Step 4: Recreate offline_event_results with TEXT player_id
create table offline_event_results (
  id uuid primary key default gen_random_uuid(),
  offline_event_id uuid references offline_events(id) on delete cascade,
  player_id text references players(id) on delete cascade,
  position integer not null,
  created_at timestamptz default now(),
  unique (offline_event_id, player_id)
);

-- Step 5: Recreate player_aliases with TEXT player_id
create table player_aliases (
  id uuid primary key default gen_random_uuid(),
  player_id text references players(id) on delete cascade,
  alias text not null,
  created_at timestamptz default now(),
  unique (alias)
);

-- Step 6: Recreate live_tournament_players with TEXT player_id
create table live_tournament_players (
  id uuid primary key default gen_random_uuid(),
  tournament_state_id uuid references live_tournament_state(id) on delete cascade,
  player_id text references players(id) on delete set null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'eliminated')),
  position integer,
  has_rebuy boolean default false,
  created_at timestamptz default now()
);

-- Step 7: Recreate indexes
create index idx_event_results_event on event_results(event_id);
create index idx_event_results_player on event_results(player_id);
create index idx_player_aliases_alias on player_aliases(lower(alias));
create index idx_player_aliases_player on player_aliases(player_id);
create index idx_live_tournament_players_state on live_tournament_players(tournament_state_id);

-- Step 8: Recreate trigger
create trigger players_updated_at before update on players
  for each row execute function update_updated_at();

-- Step 9: Enable Realtime
alter publication supabase_realtime add table live_tournament_players;

-- Step 10: Disable RLS for development
alter table players disable row level security;
alter table player_aliases disable row level security;
alter table live_tournament_players disable row level security;
alter table event_results disable row level security;
alter table offline_event_results disable row level security;
