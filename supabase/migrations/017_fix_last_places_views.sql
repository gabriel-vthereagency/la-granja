-- Migration 017: count last places correctly across legacy and current data.
--
-- A "last place" is:
--   - Current system (2026+): row with points < 0 (the -0.5 penalty).
--   - Legacy historical data: row with position_text = 'ULTIMO' (Excel import preserved
--     this text label but some legacy rows ended up with positive points 0.25, so
--     we cannot rely on points alone).
--
-- The OR-ed condition handles both. Rows that satisfy both (negative points AND
-- ULTIMO label) are counted once because each row represents one player-event pair.

CREATE OR REPLACE VIEW player_last_places AS
SELECT
  er.player_id,
  COUNT(*) AS last_places
FROM event_results er
WHERE er.points < 0 OR er.position_text = 'ULTIMO'
GROUP BY er.player_id;

CREATE OR REPLACE VIEW player_season_last_places AS
SELECT
  er.player_id,
  en.season_id,
  COUNT(*) AS last_places
FROM event_results er
JOIN event_nights en ON en.id = er.event_id
WHERE er.points < 0 OR er.position_text = 'ULTIMO'
GROUP BY er.player_id, en.season_id;
