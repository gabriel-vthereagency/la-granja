-- Migration 015: elimination_order as source of truth for tournament positions
--
-- Problem: position was assigned at elimination time as count(active) and never
-- recalculated. When a player was added or removed after eliminations had started,
-- positions of already-eliminated players became stale, producing duplicate
-- positions and a wrong "last place" assignment.
--
-- Solution: store elimination_order (1 = first eliminated, immutable). Recompute
-- position = total - elimination_order + 1 on every roster change.

-- 1. New column + unique index to prevent two players with the same order in a tournament.
ALTER TABLE live_tournament_players
  ADD COLUMN IF NOT EXISTS elimination_order integer;

CREATE UNIQUE INDEX IF NOT EXISTS idx_live_players_order_per_tournament
  ON live_tournament_players (tournament_state_id, elimination_order)
  WHERE elimination_order IS NOT NULL;

-- 2. Helper function: recalculate position for all eliminated players in a tournament.
--    Caller is responsible for holding the appropriate FOR UPDATE locks.
CREATE OR REPLACE FUNCTION recalc_positions(p_tournament_state_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_total integer;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM live_tournament_players
  WHERE tournament_state_id = p_tournament_state_id;

  UPDATE live_tournament_players
  SET position = v_total - elimination_order + 1
  WHERE tournament_state_id = p_tournament_state_id
    AND elimination_order IS NOT NULL;
END;
$$;
