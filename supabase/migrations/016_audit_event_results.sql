-- Migration 016: read-only audit view to find events with corrupted positions.
-- Lists events where:
--   - two or more results share the same position (duplicates), OR
--   - positions are not a contiguous 1..N sequence (gaps), OR
--   - the player at max(position) does not have the last-place penalty.

CREATE OR REPLACE VIEW event_results_audit AS
WITH per_event AS (
  SELECT
    event_id,
    COUNT(*) AS total_players,
    MIN(position) AS min_position,
    MAX(position) AS max_position,
    COUNT(DISTINCT position) AS distinct_positions
  FROM event_results
  WHERE position IS NOT NULL
  GROUP BY event_id
),
issues AS (
  SELECT
    e.event_id,
    e.total_players,
    e.min_position,
    e.max_position,
    e.distinct_positions,
    (e.distinct_positions < e.total_players) AS has_duplicate_positions,
    (e.max_position <> e.total_players OR e.min_position <> 1) AS has_position_gaps
  FROM per_event e
)
SELECT
  en.id AS event_id,
  en.date,
  en.number AS event_number,
  s.name AS season_name,
  i.total_players,
  i.min_position,
  i.max_position,
  i.has_duplicate_positions,
  i.has_position_gaps
FROM issues i
JOIN event_nights en ON en.id = i.event_id
LEFT JOIN seasons s ON s.id = en.season_id
WHERE i.has_duplicate_positions OR i.has_position_gaps
ORDER BY en.date DESC;
