ALTER TABLE live_tournament_state
ADD COLUMN IF NOT EXISTS tournament_name text,
ADD COLUMN IF NOT EXISTS season_name text,
ADD COLUMN IF NOT EXISTS event_number integer,
ADD COLUMN IF NOT EXISTS total_events integer;
