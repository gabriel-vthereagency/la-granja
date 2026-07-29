-- Apertura 2026 — Final Seven results
-- Champion: Galle. Full final table (9 seats) recorded in offline_events/offline_event_results.
--
-- Season id: eac3d330-68be-495a-ac9a-46fd1060dcfe (Apertura 2026)
-- Name resolution (per player_aliases): Herni = hernan, Chuchak = gabo.
-- The 9 seats = top-8 of the regular season + Rasta (9th via Fraca).

-- 1. Hall of Fame — Final Seven champion
INSERT INTO hall_of_fame (player_id, tournament_type, season_id, year)
VALUES ('galle', 'final_seven', 'eac3d330-68be-495a-ac9a-46fd1060dcfe', 2026)
ON CONFLICT (tournament_type, season_id)
DO UPDATE SET player_id = EXCLUDED.player_id, year = EXCLUDED.year;

-- 2. Offline "final" event + full result table (one row per finalist)
DO $$
DECLARE
  v_season_id uuid := 'eac3d330-68be-495a-ac9a-46fd1060dcfe';
  v_final_id uuid;
BEGIN
  INSERT INTO offline_events (season_id, type, date)
  VALUES (v_season_id, 'final', '2026-07-28')
  ON CONFLICT (season_id, type) DO UPDATE SET date = EXCLUDED.date
  RETURNING id INTO v_final_id;

  IF v_final_id IS NULL THEN
    SELECT id INTO v_final_id FROM offline_events
    WHERE season_id = v_season_id AND type = 'final';
  END IF;

  DELETE FROM offline_event_results WHERE offline_event_id = v_final_id;

  INSERT INTO offline_event_results (offline_event_id, player_id, position) VALUES
    (v_final_id, 'galle', 1),
    (v_final_id, 'ari', 2),
    (v_final_id, 'hernan', 3),
    (v_final_id, 'tala', 4),
    (v_final_id, 'rasta', 5),
    (v_final_id, 'gabo', 6),
    (v_final_id, 'shark', 7),
    (v_final_id, 'mou', 8),
    (v_final_id, 'lean', 9);
END $$;
