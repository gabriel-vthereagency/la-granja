-- =============================================
-- SUMMER 2026: Delete fake test data, insert real data
-- Uses DO block with UUID variables since seasons.id is UUID type
-- =============================================

-- 1. Delete old fake Summer 2026 data
DELETE FROM event_results WHERE event_id IN (
  SELECT en.id FROM event_nights en
  JOIN seasons s ON s.id = en.season_id
  WHERE s.type = 'summer' AND s.year = 2026
);

DELETE FROM event_nights WHERE season_id IN (
  SELECT id FROM seasons WHERE type = 'summer' AND year = 2026
);

DELETE FROM seasons WHERE type = 'summer' AND year = 2026;

-- 2. Ensure players exist
INSERT INTO players (id, name, is_active) VALUES ('galle', 'Galle', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('tala', 'Tala', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('tinchob', 'Tincho B', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('pep', 'Pep', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('yeti', 'Yeti', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('nato', 'Nato', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('gianni', 'Gianni', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('franm', 'Fran M', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('shark', 'Shark', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('halcon', 'Halcón', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('orfa', 'Orfa', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('gabo', 'Gabo', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('teto', 'Teto', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('rasta', 'Rasta', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('dieguito', 'Dieguito', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('mou', 'Mou', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('arana', 'Araña', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('jero', 'Jero', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('lean', 'Lean', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('cachi', 'Cachi', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('guille', 'Guille', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('ari', 'Ari', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('toti', 'Toti', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('hernan', 'Hernan', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('ruso', 'Ruso', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('fechele', 'Fechele', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('yamo', 'Yamo', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('nahue', 'Nahue', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('grosman', 'Grosman', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('tempo', 'Tempo', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO players (id, name, is_active) VALUES ('chelo', 'Chelo', true) ON CONFLICT (id) DO NOTHING;

-- 3. Create season + events + results using DO block with UUID variables
DO $$
DECLARE
  v_season_id uuid := gen_random_uuid();
  v_f1 uuid := gen_random_uuid();
  v_f2 uuid := gen_random_uuid();
  v_f3 uuid := gen_random_uuid();
  v_f4 uuid := gen_random_uuid();
  v_f5 uuid := gen_random_uuid();
  v_f6 uuid := gen_random_uuid();
  v_f7 uuid := gen_random_uuid();
  v_f8 uuid := gen_random_uuid();
  v_f9 uuid := gen_random_uuid();
  v_f10 uuid := gen_random_uuid();
BEGIN
  -- Create season
  INSERT INTO seasons (id, type, year, name, status)
  VALUES (v_season_id, 'summer', 2026, 'Summer Cup 2026', 'finished');

  -- Create 10 event nights
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f1, v_season_id, 1, '2026-01-03', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f2, v_season_id, 2, '2026-01-10', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f3, v_season_id, 3, '2026-01-17', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f4, v_season_id, 4, '2026-01-24', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f5, v_season_id, 5, '2026-01-31', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f6, v_season_id, 6, '2026-02-07', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f7, v_season_id, 7, '2026-02-14', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f8, v_season_id, 8, '2026-02-21', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f9, v_season_id, 9, '2026-02-28', 'finished');
  INSERT INTO event_nights (id, season_id, number, date, status) VALUES (v_f10, v_season_id, 10, '2026-03-07', 'finished');

  -- Event results: Galle (8 events, 43.54 pts total)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'galle', 1, 5.44, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'galle', 2, 5.44, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'galle', 2, 5.44, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'galle', 4, 5.44, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'galle', 7, 5.44, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'galle', 18, 5.44, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'galle', 12, 5.44, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'galle', 12, 5.42, false);

  -- Tala (8 events, 39.79 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'tala', 2, 4.97, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'tala', 2, 4.97, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'tala', 3, 4.97, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'tala', 4, 4.97, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'tala', 5, 4.97, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'tala', 5, 4.97, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'tala', 5, 4.97, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'tala', 7, 5.01, true);

  -- Tincho B (7 events, 32.41 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'tinchob', 1, 4.63, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'tinchob', 2, 4.63, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'tinchob', 5, 4.63, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'tinchob', 12, 4.63, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'tinchob', 12, 4.63, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'tinchob', 12, 4.63, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'tinchob', 12, 4.62, false);

  -- Pep (9 events, 31.5 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'pep', 1, 3.5, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'pep', 3, 3.5, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'pep', 5, 3.5, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'pep', 7, 3.5, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'pep', 7, 3.5, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'pep', 7, 3.5, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'pep', 12, 3.5, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'pep', 12, 3.5, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'pep', 12, 3.5, false);

  -- Yeti (8 events, 27.6 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'yeti', 2, 3.45, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'yeti', 2, 3.45, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'yeti', 7, 3.45, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'yeti', 7, 3.45, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'yeti', 12, 3.45, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'yeti', 12, 3.45, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'yeti', 12, 3.45, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'yeti', 12, 3.45, false);

  -- Nato (8 events, 27.3 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'nato', 1, 3.41, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'nato', 4, 3.41, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'nato', 5, 3.41, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'nato', 7, 3.41, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'nato', 7, 3.41, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'nato', 12, 3.41, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'nato', 12, 3.41, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'nato', 12, 3.43, false);

  -- Gianni (7 events, 25.9 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'gianni', 1, 3.7, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'gianni', 4, 3.7, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'gianni', 5, 3.7, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'gianni', 7, 3.7, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'gianni', 12, 3.7, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'gianni', 12, 3.7, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'gianni', 12, 3.7, false);

  -- Fran M (6 events, 25.6 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'franm', 1, 4.27, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'franm', 4, 4.27, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'franm', 5, 4.27, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'franm', 7, 4.27, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'franm', 12, 4.27, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'franm', 12, 4.25, false);

  -- Shark (8 events, 25.6 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'shark', 1, 3.2, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'shark', 4, 3.2, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'shark', 7, 3.2, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'shark', 7, 3.2, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'shark', 18, 3.2, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'shark', 12, 3.2, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'shark', 12, 3.2, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'shark', 12, 3.2, false);

  -- Halcón (6 events, 25.1 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'halcon', 3, 4.18, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'halcon', 3, 4.18, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'halcon', 3, 4.18, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'halcon', 5, 4.18, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'halcon', 7, 4.18, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'halcon', 12, 4.2, false);

  -- Orfa (9 events, 23.4 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'orfa', 1, 2.6, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'orfa', 7, 2.6, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'orfa', 7, 2.6, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'orfa', 18, 2.6, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'orfa', 12, 2.6, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'orfa', 12, 2.6, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'orfa', 12, 2.6, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'orfa', 12, 2.6, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'orfa', 12, 2.6, false);

  -- Gabo (8 events, 22.5 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'gabo', 2, 2.81, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'gabo', 3, 2.81, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'gabo', 7, 2.81, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'gabo', 7, 2.81, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'gabo', 7, 2.81, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'gabo', 18, 2.81, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'gabo', 12, 2.81, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'gabo', 12, 2.83, false);

  -- Teto (5 events, 21.3 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'teto', 2, 4.26, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'teto', 3, 4.26, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'teto', 7, 4.26, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'teto', 7, 4.26, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'teto', 12, 4.26, false);

  -- Rasta (5 events, 20.9 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'rasta', 1, 4.18, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'rasta', 5, 4.18, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'rasta', 12, 4.18, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'rasta', 12, 4.18, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'rasta', 12, 4.18, false);

  -- Dieguito (4 events, 19.4 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'dieguito', 1, 4.85, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'dieguito', 7, 4.85, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'dieguito', 12, 4.85, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'dieguito', 12, 4.85, false);

  -- Mou (8 events, 18.9 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'mou', 2, 2.36, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'mou', 4, 2.36, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'mou', 7, 2.36, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'mou', 7, 2.36, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'mou', 7, 2.36, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'mou', 18, 2.36, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'mou', 12, 2.36, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'mou', 12, 2.38, false);

  -- Araña (6 events, 9.6 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'arana', 3, 1.6, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'arana', 7, 1.6, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'arana', 18, 1.6, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'arana', 12, 1.6, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'arana', 12, 1.6, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'arana', 12, 1.6, false);

  -- Jero (6 events, 9.1 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'jero', 3, 1.52, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'jero', 18, 1.52, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'jero', 12, 1.52, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'jero', 12, 1.52, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'jero', 12, 1.52, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'jero', 12, 1.5, false);

  -- Lean (7 events, 8.3 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'lean', 4, 1.19, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'lean', 7, 1.19, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'lean', 12, 1.19, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'lean', 12, 1.19, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'lean', 12, 1.19, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'lean', 12, 1.19, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'lean', 12, 1.16, false);

  -- Cachi (3 events, 5.6 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'cachi', 4, 1.87, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'cachi', 12, 1.87, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'cachi', 12, 1.86, false);

  -- Guille (8 events, 5.3 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'guille', 7, 0.66, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'guille', 7, 0.66, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'guille', 7, 0.66, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'guille', 18, 0.66, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'guille', 12, 0.66, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'guille', 12, 0.66, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'guille', 12, 0.66, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'guille', 12, 0.68, false);

  -- Ari (8 events, 5.2 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'ari', 7, 0.65, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'ari', 7, 0.65, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'ari', 12, 0.65, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'ari', 12, 0.65, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'ari', 12, 0.65, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'ari', 12, 0.65, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'ari', 12, 0.65, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'ari', 12, 0.65, false);

  -- Toti (2 events, 4.7 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'toti', 4, 2.35, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'toti', 12, 2.35, false);

  -- Hernan (3 events, 2.6 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'hernan', 7, 0.87, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'hernan', 12, 0.87, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'hernan', 12, 0.86, false);

  -- Ruso (3 events, 2.6 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'ruso', 7, 0.87, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'ruso', 12, 0.87, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'ruso', 12, 0.86, false);

  -- Fechele (3 events, 2.5 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'fechele', 7, 0.83, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'fechele', 7, 0.83, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'fechele', 12, 0.84, false);

  -- Yamo (3 events, 2.2 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'yamo', 7, 0.73, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'yamo', 12, 0.73, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'yamo', 12, 0.74, false);

  -- Nahue (3 events, 2.0 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'nahue', 7, 0.67, true);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'nahue', 12, 0.67, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f9, 'nahue', 12, 0.66, false);

  -- Grosman (4 events, 1.0 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f10, 'grosman', 18, 0.25, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f1, 'grosman', 12, 0.25, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f2, 'grosman', 12, 0.25, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f3, 'grosman', 12, 0.25, false);

  -- Tempo (2 events, 1.0 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f4, 'tempo', 12, 0.5, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f5, 'tempo', 12, 0.5, false);

  -- Chelo (3 events, 0.5 pts)
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f6, 'chelo', 18, 0.17, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f7, 'chelo', 12, 0.17, false);
  INSERT INTO event_results (event_id, player_id, position, points, is_final_table) VALUES (v_f8, 'chelo', 12, 0.16, false);

END $$;
