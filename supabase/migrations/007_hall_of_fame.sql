-- Hall of Fame - Campeones históricos
CREATE TABLE IF NOT EXISTS hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text REFERENCES players(id) ON DELETE CASCADE,
  tournament_type text NOT NULL CHECK (tournament_type IN ('final_seven', 'summer_cup', 'summer', 'apertura', 'clausura', 'fraca', 'regular')),
  season_id uuid REFERENCES seasons(id) ON DELETE SET NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indices para queries
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_player ON hall_of_fame(player_id);
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_type ON hall_of_fame(tournament_type);
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_year ON hall_of_fame(year);

-- Constraint único para evitar duplicados (un campeón por tipo/año)
-- Nota: season_id puede ser null para datos históricos
ALTER TABLE hall_of_fame ADD CONSTRAINT hall_of_fame_unique_champion
  UNIQUE (tournament_type, year);
