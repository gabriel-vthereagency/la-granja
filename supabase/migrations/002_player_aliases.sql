-- Migration: Add player_aliases and live_tournament_players tables
-- Run this in Supabase SQL Editor
-- NOTE: This migration assumes players.id is TEXT (run 003_text_player_ids.sql first if upgrading from UUID)

-- Aliases de jugadores (para matcheo desde WhatsApp)
create table if not exists player_aliases (
  id uuid primary key default gen_random_uuid(),
  player_id text references players(id) on delete cascade,
  alias text not null,
  created_at timestamptz default now(),
  unique (alias)
);

-- Jugadores en torneo en vivo
create table if not exists live_tournament_players (
  id uuid primary key default gen_random_uuid(),
  tournament_state_id uuid references live_tournament_state(id) on delete cascade,
  player_id text references players(id) on delete set null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'eliminated')),
  position integer,
  has_rebuy boolean default false,
  created_at timestamptz default now()
);

-- Agregar buy_in_amount a live_tournament_state si no existe
alter table live_tournament_state
add column if not exists buy_in_amount integer default 10000;

-- Indices
create index if not exists idx_player_aliases_alias on player_aliases(lower(alias));
create index if not exists idx_player_aliases_player on player_aliases(player_id);
create index if not exists idx_live_tournament_players_state on live_tournament_players(tournament_state_id);

-- Habilitar Realtime para live_tournament_players
alter publication supabase_realtime add table live_tournament_players;

-- Desactivar RLS para desarrollo
alter table player_aliases disable row level security;
alter table live_tournament_players disable row level security;
