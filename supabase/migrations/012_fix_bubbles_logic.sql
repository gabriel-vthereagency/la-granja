-- Fix: respect is_bubble=false, only fallback to position=6 when is_bubble IS NULL
-- Before: er.position = 6 OR er.is_bubble = true (ignores is_bubble=false)
-- After:  er.is_bubble = true OR (er.is_bubble IS NULL AND er.position = 6)

-- Must DROP CASCADE because of view dependencies (hall_of_shame_stats)
DROP VIEW IF EXISTS season_standings CASCADE;
DROP VIEW IF EXISTS player_complete_stats CASCADE;
DROP VIEW IF EXISTS player_season_stats CASCADE;
DROP VIEW IF EXISTS player_global_stats CASCADE;

CREATE VIEW player_global_stats AS
SELECT
  er.player_id,
  p.name as player_name,
  p.avatar_url,
  COUNT(*) as total_events,
  COALESCE(SUM(er.points), 0) as total_points,
  CASE WHEN COUNT(*) > 0 THEN ROUND(COALESCE(SUM(er.points), 0) / COUNT(*)::numeric, 2) ELSE 0 END as effectiveness,
  SUM(CASE WHEN er.position = 1 THEN 1 ELSE 0 END) as golds,
  SUM(CASE WHEN er.position = 2 THEN 1 ELSE 0 END) as silvers,
  SUM(CASE WHEN er.position = 3 THEN 1 ELSE 0 END) as bronzes,
  SUM(CASE WHEN er.position = 4 THEN 1 ELSE 0 END) as fourths,
  SUM(CASE WHEN er.position = 5 THEN 1 ELSE 0 END) as fifths,
  SUM(CASE WHEN er.position > 0 AND er.position <= 5 THEN 1 ELSE 0 END) as podiums,
  SUM(CASE WHEN er.is_bubble = true OR (er.is_bubble IS NULL AND er.position = 6) THEN 1 ELSE 0 END) as bubbles,
  SUM(CASE WHEN COALESCE(er.is_final_table, er.position > 0 AND er.position <= 9) THEN 1 ELSE 0 END) as final_tables,
  MIN(en.date) as member_since
FROM event_results er
JOIN players p ON p.id = er.player_id
JOIN event_nights en ON en.id = er.event_id
GROUP BY er.player_id, p.name, p.avatar_url;

CREATE VIEW player_season_stats AS
SELECT
  er.player_id,
  en.season_id,
  p.name as player_name,
  p.avatar_url,
  p.nickname,
  p.is_active,
  COUNT(*) as events_played,
  COALESCE(SUM(er.points), 0) as total_points,
  SUM(CASE WHEN er.position = 1 THEN 1 ELSE 0 END) as golds,
  SUM(CASE WHEN er.position = 2 THEN 1 ELSE 0 END) as silvers,
  SUM(CASE WHEN er.position = 3 THEN 1 ELSE 0 END) as bronzes,
  SUM(CASE WHEN er.position = 4 THEN 1 ELSE 0 END) as fourths,
  SUM(CASE WHEN er.position = 5 THEN 1 ELSE 0 END) as fifths,
  SUM(CASE WHEN er.position > 0 AND er.position <= 5 THEN 1 ELSE 0 END) as podiums,
  SUM(CASE WHEN er.is_bubble = true OR (er.is_bubble IS NULL AND er.position = 6) THEN 1 ELSE 0 END) as bubbles,
  SUM(CASE WHEN COALESCE(er.is_final_table, er.position > 0 AND er.position <= 9) THEN 1 ELSE 0 END) as final_tables
FROM event_results er
JOIN event_nights en ON en.id = er.event_id
JOIN players p ON p.id = er.player_id
WHERE en.status = 'finished'
GROUP BY er.player_id, en.season_id, p.name, p.avatar_url, p.nickname, p.is_active;

-- Recreate dependent views
CREATE VIEW player_complete_stats AS
SELECT
  pgs.*,
  COALESCE(plp.last_places, 0) as last_places
FROM player_global_stats pgs
LEFT JOIN player_last_places plp ON plp.player_id = pgs.player_id;

CREATE VIEW season_standings AS
SELECT
  pss.*,
  COALESCE(pslp.last_places, 0) as last_places,
  ROW_NUMBER() OVER (PARTITION BY pss.season_id ORDER BY pss.total_points DESC) as position
FROM player_season_stats pss
LEFT JOIN player_season_last_places pslp
  ON pslp.player_id = pss.player_id
  AND pslp.season_id = pss.season_id;

-- Recreate hall_of_shame_stats (dropped by CASCADE)
CREATE VIEW hall_of_shame_stats AS
SELECT
  pcs.player_id,
  pcs.player_name,
  pcs.last_places,
  pcs.bubbles,
  pcs.silvers as second_places
FROM player_complete_stats pcs
WHERE pcs.total_events >= 10;
