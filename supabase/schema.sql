-- La Granja Poker - Database Schema

-- Jugadores (id es texto/slug, ej: "shark", "gabo")
create table players (
  id text primary key,
  name text not null,
  nickname text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Temporadas (Apertura, Clausura, Summer Cup)
create table seasons (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('apertura', 'clausura', 'summer')),
  year integer not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'finished')),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (type, year)
);

-- Fechas/Noches de torneo
create table event_nights (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  number integer not null,
  date date not null,
  players_count integer,
  venue text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (season_id, number)
);

-- Resultados de cada fecha
create table event_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references event_nights(id) on delete cascade,
  player_id text references players(id) on delete cascade,
  position integer,
  rebuys integer default 0,
  points numeric(5,2) default 0, -- Soporta decimales: 0.25, -0.25
  prize numeric(10,2) default 0,
  position_text text,
  position_label text,
  is_bubble boolean,
  bounty_count numeric,
  bounty_credit_name text,
  created_at timestamptz default now(),
  unique (event_id, player_id)
);

-- Eventos offline (Fraca, Final)
create table offline_events (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  type text not null check (type in ('fraca', 'final')),
  date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (season_id, type)
);

-- Resultados de eventos offline
create table offline_event_results (
  id uuid primary key default gen_random_uuid(),
  offline_event_id uuid references offline_events(id) on delete cascade,
  player_id text references players(id) on delete cascade,
  position integer not null,
  created_at timestamptz default now(),
  unique (offline_event_id, player_id)
);

-- Estado en vivo del torneo (para sync realtime)
create table live_tournament_state (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references event_nights(id) on delete cascade unique,
  current_level integer default 0,
  time_remaining integer default 720, -- segundos (12 min nivel 1)
  is_paused boolean default true,
  buy_in_amount integer default 10000, -- valor de la caja en pesos
  tournament_name text, -- ej: "LA GRANJA POKER"
  season_name text, -- ej: "Summer Cup 2026"
  event_number integer, -- ej: 7
  total_events integer, -- ej: 9
  updated_at timestamptz default now()
);

-- Habilitar Realtime para live_tournament_state y players
alter publication supabase_realtime add table live_tournament_state;
alter publication supabase_realtime add table live_tournament_players;

-- Aliases de jugadores (para matcheo desde WhatsApp)
create table player_aliases (
  id uuid primary key default gen_random_uuid(),
  player_id text references players(id) on delete cascade,
  alias text not null,
  created_at timestamptz default now(),
  unique (alias)
);

-- Jugadores en torneo en vivo
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

-- Indices para queries comunes
create index idx_event_nights_season on event_nights(season_id);
create index idx_event_results_event on event_results(event_id);
create index idx_event_results_player on event_results(player_id);
create index idx_player_aliases_alias on player_aliases(lower(alias));
create index idx_player_aliases_player on player_aliases(player_id);
create index idx_live_tournament_players_state on live_tournament_players(tournament_state_id);

-- Trigger para updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger players_updated_at before update on players
  for each row execute function update_updated_at();

create trigger seasons_updated_at before update on seasons
  for each row execute function update_updated_at();

create trigger event_nights_updated_at before update on event_nights
  for each row execute function update_updated_at();

create trigger offline_events_updated_at before update on offline_events
  for each row execute function update_updated_at();

create trigger live_tournament_state_updated_at before update on live_tournament_state
  for each row execute function update_updated_at();
