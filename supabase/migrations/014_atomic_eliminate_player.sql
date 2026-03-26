-- Migration 014: Atomic server-side player elimination
-- Fixes race condition where multiple devices assign the same position
-- by moving position calculation to a serializable database function.

-- Function: eliminate_player
-- Called via supabase.rpc('eliminate_player', { p_player_id: uuid })
-- Returns the assigned position as an integer.
--
-- How it works:
-- 1. Locks the player row and all active rows in the tournament (FOR UPDATE)
-- 2. Counts currently active players (including the one being eliminated)
-- 3. Position = active count (the last active player gets position = total active)
-- 4. The lock serializes concurrent eliminations from multiple devices
-- 5. Returns the assigned position so the client can update local state

CREATE OR REPLACE FUNCTION eliminate_player(p_player_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_tournament_state_id uuid;
  v_active_count integer;
  v_position integer;
BEGIN
  -- Get the tournament this player belongs to (lock the row)
  SELECT tournament_state_id INTO v_tournament_state_id
  FROM live_tournament_players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_tournament_state_id IS NULL THEN
    RAISE EXCEPTION 'Player % not found', p_player_id;
  END IF;

  -- Lock all active player rows in this tournament to serialize
  -- concurrent eliminations from multiple devices.
  -- FOR UPDATE cannot be used with aggregate functions, so we lock
  -- first with PERFORM, then count separately.
  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id
    AND status = 'active'
  FOR UPDATE;

  -- Count active players (including the one being eliminated)
  SELECT COUNT(*) INTO v_active_count
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id
    AND status = 'active';

  -- Position = number of active players (last active = highest position number)
  v_position := v_active_count;

  -- Update the player
  UPDATE live_tournament_players
  SET status = 'eliminated',
      position = v_position
  WHERE id = p_player_id
    AND status = 'active';

  -- Verify the update happened (player wasn't already eliminated)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player % is not active (already eliminated or removed)', p_player_id;
  END IF;

  RETURN v_position;
END;
$$;
