-- Migration 017: count last places by negative points, not by max(position).
--
-- Problem: the old views (player_last_places, player_season_last_places) counted
-- a "last place" as any row where position = MAX(position) for that event.
-- Historical data has many duplicate positions, so multiple players ended up
-- counted as last place for the same event, inflating the stat.
--
-- Solution: a last place is a row with negative points (the -0.5 or legacy -0.25
-- penalty). This works for both legacy and current data and is unambiguous.

CREATE OR REPLACE VIEW player_last_places AS
SELECT
  er.player_id,
  COUNT(*) AS last_places
FROM event_results er
WHERE er.points < 0
GROUP BY er.player_id;

CREATE OR REPLACE VIEW player_season_last_places AS
SELECT
  er.player_id,
  en.season_id,
  COUNT(*) AS last_places
FROM event_results er
JOIN event_nights en ON en.id = er.event_id
WHERE er.points < 0
GROUP BY er.player_id, en.season_id;
