-- Fix duplicate last places in views
--
-- Problema: si dos jugadores son eliminados simultáneamente (misma mano),
-- ambos pueden quedar con la misma posición máxima en event_results.
-- Las vistas anteriores los contaban a AMBOS como "último lugar",
-- afectando las estadísticas y el Hall of Shame.
--
-- Solución: solo contar como "último" a los eventos donde exactamente
-- UN jugador tiene la posición máxima. Si hay empate, ninguno es "el último".

-- ============================================
-- Recrear vista de últimos puestos por jugador
-- (solo eventos con un único jugador en el máximo)
-- ============================================
CREATE OR REPLACE VIEW player_last_places AS
SELECT
  er.player_id,
  COUNT(*) as last_places
FROM event_results er
JOIN event_max_positions emp ON emp.event_id = er.event_id
WHERE er.position = emp.max_position
  AND er.position > 1
  -- Solo contar como último si exactamente un jugador tiene esa posición
  AND (
    SELECT COUNT(*)
    FROM event_results er2
    WHERE er2.event_id = er.event_id
      AND er2.position = emp.max_position
  ) = 1
GROUP BY er.player_id;

-- ============================================
-- Recrear vista de últimos puestos por temporada
-- (solo eventos con un único jugador en el máximo)
-- ============================================
CREATE OR REPLACE VIEW player_season_last_places AS
SELECT
  er.player_id,
  en.season_id,
  COUNT(*) as last_places
FROM event_results er
JOIN event_nights en ON en.id = er.event_id
JOIN event_max_positions emp ON emp.event_id = er.event_id
WHERE er.position = emp.max_position
  AND er.position > 1
  -- Solo contar como último si exactamente un jugador tiene esa posición
  AND (
    SELECT COUNT(*)
    FROM event_results er2
    WHERE er2.event_id = er.event_id
      AND er2.position = emp.max_position
  ) = 1
GROUP BY er.player_id, en.season_id;
