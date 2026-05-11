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

-- 3. Rewrite eliminate_player to use elimination_order + recalc_positions.
--    Returns the position now assigned to the player (after recalc).
CREATE OR REPLACE FUNCTION eliminate_player(p_player_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_tournament_state_id uuid;
  v_next_order integer;
  v_assigned_position integer;
BEGIN
  SELECT tournament_state_id INTO v_tournament_state_id
  FROM live_tournament_players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_tournament_state_id IS NULL THEN
    RAISE EXCEPTION 'Player % not found', p_player_id;
  END IF;

  -- Lock all rows in this tournament so concurrent eliminations / adds / removes
  -- on the same tournament serialize through this RPC.
  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id
  FOR UPDATE;

  -- Next elimination_order: 1 if first eliminated, else max+1.
  SELECT COALESCE(MAX(elimination_order), 0) + 1 INTO v_next_order
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id;

  UPDATE live_tournament_players
  SET status = 'eliminated',
      elimination_order = v_next_order
  WHERE id = p_player_id
    AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player % is not active (already eliminated or removed)', p_player_id;
  END IF;

  PERFORM recalc_positions(v_tournament_state_id);

  SELECT position INTO v_assigned_position
  FROM live_tournament_players
  WHERE id = p_player_id;

  RETURN v_assigned_position;
END;
$$;

-- 4. add_player RPC: inserta un jugador y recalcula posiciones de los eliminados.
CREATE OR REPLACE FUNCTION add_player(
  p_tournament_state_id uuid,
  p_player_id text,
  p_name text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_id uuid;
BEGIN
  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = p_tournament_state_id
  FOR UPDATE;

  INSERT INTO live_tournament_players (
    tournament_state_id, player_id, name, status, has_rebuy
  ) VALUES (
    p_tournament_state_id, p_player_id, p_name, 'active', false
  )
  RETURNING id INTO v_new_id;

  PERFORM recalc_positions(p_tournament_state_id);

  RETURN v_new_id;
END;
$$;

-- 5. remove_player RPC: borra un jugador y recalcula posiciones.
--    Solo permitido si el jugador está activo (un eliminado no debería borrarse).
CREATE OR REPLACE FUNCTION remove_player(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_tournament_state_id uuid;
  v_status text;
BEGIN
  SELECT tournament_state_id, status INTO v_tournament_state_id, v_status
  FROM live_tournament_players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_tournament_state_id IS NULL THEN
    RAISE EXCEPTION 'Player % not found', p_player_id;
  END IF;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'Cannot remove eliminated player % (use revert_elimination first)', p_player_id;
  END IF;

  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id
  FOR UPDATE;

  DELETE FROM live_tournament_players WHERE id = p_player_id;

  PERFORM recalc_positions(v_tournament_state_id);
END;
$$;

-- 6. revert_elimination RPC: deshace una eliminación.
--    El jugador vuelve a 'active', se le quita elimination_order y position.
--    Los demás eliminados conservan su elimination_order pero su position se
--    recalcula con el nuevo total efectivo (los activos no afectan el cálculo
--    porque elimination_order es NULL para ellos, pero sí afectan v_total).
CREATE OR REPLACE FUNCTION revert_elimination(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_tournament_state_id uuid;
  v_reverted_order integer;
BEGIN
  SELECT tournament_state_id, elimination_order
  INTO v_tournament_state_id, v_reverted_order
  FROM live_tournament_players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_tournament_state_id IS NULL THEN
    RAISE EXCEPTION 'Player % not found', p_player_id;
  END IF;

  IF v_reverted_order IS NULL THEN
    RAISE EXCEPTION 'Player % is not eliminated', p_player_id;
  END IF;

  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id
  FOR UPDATE;

  -- Quitar al jugador del orden de eliminación y compactar los órdenes mayores
  -- (los que se eliminaron DESPUÉS bajan 1 puesto en el orden).
  UPDATE live_tournament_players
  SET status = 'active',
      position = NULL,
      elimination_order = NULL
  WHERE id = p_player_id;

  UPDATE live_tournament_players
  SET elimination_order = elimination_order - 1
  WHERE tournament_state_id = v_tournament_state_id
    AND elimination_order > v_reverted_order;

  PERFORM recalc_positions(v_tournament_state_id);
END;
$$;

-- 7. Backfill elimination_order for eliminated players in any in-progress tournament.
--    Strategy: derive elimination_order from the current `position` column,
--    inverting the formula: elimination_order = (total_in_tournament) - position + 1.
--    This is best-effort: if positions are already corrupted (duplicates, gaps),
--    the backfill will reflect that corruption. Live tournaments should be empty
--    at deploy time anyway (the bug only manifests during a tournament).
WITH totals AS (
  SELECT tournament_state_id, COUNT(*) AS total
  FROM live_tournament_players
  GROUP BY tournament_state_id
)
UPDATE live_tournament_players p
SET elimination_order = totals.total - p.position + 1
FROM totals
WHERE p.tournament_state_id = totals.tournament_state_id
  AND p.status = 'eliminated'
  AND p.position IS NOT NULL
  AND p.elimination_order IS NULL;
