-- Add tiebreaker rules to season_standings for Final and Fraca classification
-- Rules (in order):
-- 1. Most total points
-- 2. Most golds (1st places)
-- 3. Most silvers (2nd places)
-- 4. Most bronzes (3rd places)
-- 5. Most 4th places
-- 6. Most 5th places
-- 7. Fewest last places
-- 8. Best position in the last event played

CREATE OR REPLACE VIEW season_standings AS
SELECT
  pss.*,
  COALESCE(pslp.last_places, 0) as last_places,
  COALESCE(last_evt.last_event_position, 999) as last_event_position,
  ROW_NUMBER() OVER (
    PARTITION BY pss.season_id
    ORDER BY
      pss.total_points DESC,
      pss.golds DESC,
      pss.silvers DESC,
      pss.bronzes DESC,
      pss.fourths DESC,
      pss.fifths DESC,
      COALESCE(pslp.last_places, 0) ASC,
      COALESCE(last_evt.last_event_position, 999) ASC
  ) as position
FROM player_season_stats pss
LEFT JOIN player_season_last_places pslp
  ON pslp.player_id = pss.player_id
  AND pslp.season_id = pss.season_id
LEFT JOIN LATERAL (
  SELECT er.position as last_event_position
  FROM event_results er
  JOIN event_nights en ON en.id = er.event_id
  WHERE er.player_id = pss.player_id
    AND en.season_id = pss.season_id
    AND en.status = 'finished'
  ORDER BY en.date DESC, en.number DESC
  LIMIT 1
) last_evt ON true;
