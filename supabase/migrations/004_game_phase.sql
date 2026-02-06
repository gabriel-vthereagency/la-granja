-- Agregar fase del torneo y datos del campeón
ALTER TABLE live_tournament_state
ADD COLUMN IF NOT EXISTS game_phase text NOT NULL DEFAULT 'normal';

-- Agregar constraint por separado (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'live_tournament_state_game_phase_check'
  ) THEN
    ALTER TABLE live_tournament_state
    ADD CONSTRAINT live_tournament_state_game_phase_check
    CHECK (game_phase IN ('normal', 'final_table', 'heads_up', 'champion'));
  END IF;
END $$;

ALTER TABLE live_tournament_state
ADD COLUMN IF NOT EXISTS champion_id text REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE live_tournament_state
ADD COLUMN IF NOT EXISTS champion_name text;
