-- Performance Views for La Granja Poker
-- These views pre-calculate statistics to reduce client-side processing

-- ============================================
-- 1. Vista de estadísticas globales por jugador (histórico completo)
-- ============================================
CREATE OR REPLACE VIEW player_global_stats AS
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
  SUM(CASE WHEN er.position <= 5 THEN 1 ELSE 0 END) as podiums,
  SUM(CASE WHEN er.position = 6 OR er.is_bubble = true THEN 1 ELSE 0 END) as bubbles,
  SUM(CASE WHEN er.position <= 9 THEN 1 ELSE 0 END) as final_tables,
  MIN(en.date) as member_since
FROM event_results er
JOIN players p ON p.id = er.player_id
JOIN event_nights en ON en.id = er.event_id
GROUP BY er.player_id, p.name, p.avatar_url;

-- ============================================
-- 2. Vista de último puesto por evento (para calcular "últimos")
-- ============================================
CREATE OR REPLACE VIEW event_max_positions AS
SELECT
  event_id,
  MAX(position) as max_position
FROM event_results
WHERE position > 0
GROUP BY event_id;

-- ============================================
-- 3. Vista de últimos puestos por jugador
-- ============================================
CREATE OR REPLACE VIEW player_last_places AS
SELECT
  er.player_id,
  COUNT(*) as last_places
FROM event_results er
JOIN event_max_positions emp ON emp.event_id = er.event_id
WHERE er.position = emp.max_position AND er.position > 1
GROUP BY er.player_id;

-- ============================================
-- 4. Vista combinada de stats con últimos puestos
-- ============================================
CREATE OR REPLACE VIEW player_complete_stats AS
SELECT
  pgs.*,
  COALESCE(plp.last_places, 0) as last_places
FROM player_global_stats pgs
LEFT JOIN player_last_places plp ON plp.player_id = pgs.player_id;

-- ============================================
-- 5. Vista de estadísticas por temporada
-- ============================================
CREATE OR REPLACE VIEW player_season_stats AS
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
  SUM(CASE WHEN er.position <= 5 THEN 1 ELSE 0 END) as podiums,
  SUM(CASE WHEN er.position = 6 OR er.is_bubble = true THEN 1 ELSE 0 END) as bubbles,
  SUM(CASE WHEN er.position <= 9 THEN 1 ELSE 0 END) as final_tables
FROM event_results er
JOIN event_nights en ON en.id = er.event_id
JOIN players p ON p.id = er.player_id
WHERE en.status = 'finished'
GROUP BY er.player_id, en.season_id, p.name, p.avatar_url, p.nickname, p.is_active;

-- ============================================
-- 6. Vista de últimos puestos por temporada
-- ============================================
CREATE OR REPLACE VIEW player_season_last_places AS
SELECT
  er.player_id,
  en.season_id,
  COUNT(*) as last_places
FROM event_results er
JOIN event_nights en ON en.id = er.event_id
JOIN event_max_positions emp ON emp.event_id = er.event_id
WHERE er.position = emp.max_position AND er.position > 1
GROUP BY er.player_id, en.season_id;

-- ============================================
-- 7. Vista de standings por temporada (lista para usar)
-- ============================================
CREATE OR REPLACE VIEW season_standings AS
SELECT
  pss.*,
  COALESCE(pslp.last_places, 0) as last_places,
  ROW_NUMBER() OVER (PARTITION BY pss.season_id ORDER BY pss.total_points DESC) as position
FROM player_season_stats pss
LEFT JOIN player_season_last_places pslp
  ON pslp.player_id = pss.player_id
  AND pslp.season_id = pss.season_id;

-- ============================================
-- 8. Vista para Hall of Shame (top records negativos)
-- ============================================
CREATE OR REPLACE VIEW hall_of_shame_stats AS
SELECT
  pcs.player_id,
  pcs.player_name,
  pcs.last_places,
  pcs.bubbles,
  pcs.silvers as second_places
FROM player_complete_stats pcs
WHERE pcs.total_events >= 10;  -- Mínimo de participación

-- ============================================
-- 9. Vista de última fecha por temporada (para podio)
-- ============================================
CREATE OR REPLACE VIEW last_event_per_season AS
SELECT DISTINCT ON (en.season_id)
  en.season_id,
  en.id as event_id,
  en.number as event_number,
  en.date
FROM event_nights en
WHERE en.status = 'finished'
ORDER BY en.season_id, en.number DESC;
