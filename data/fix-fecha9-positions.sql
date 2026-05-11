-- Fix para Fecha 9 Apertura (2026-05-05). NO ES UNA MIGRACIÓN.
-- Correrlo manualmente en SQL editor de Supabase tras confirmar con el usuario
-- el orden real entre Yamo y Fran M.
--
-- Pasos:
-- 1. Verificar que el event_id es el correcto.
-- 2. Decidir cuál de los dos (Yamo o Fran M) quedó realmente 22° y cuál 23°.
-- 3. Comentar/descomentar el bloque correspondiente más abajo.
-- 4. Ejecutar todo el script en una sola transacción.

BEGIN;

-- Verificación previa: mostrar el estado actual.
SELECT player_id, position, points
FROM event_results
WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf'
  AND player_id IN ('yamo', 'franm', 'teto', 'toti')
ORDER BY position, player_id;

-- === EDITAR A MANO: descomentar UNO de los dos bloques ===

-- Opción A: Yamo 22°, Fran M 23°, Teto 24°, Toti 25°
-- UPDATE event_results SET position = 22 WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf' AND player_id = 'yamo';
-- UPDATE event_results SET position = 23 WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf' AND player_id = 'franm';
-- UPDATE event_results SET position = 24 WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf' AND player_id = 'teto';
-- UPDATE event_results SET position = 25 WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf' AND player_id = 'toti';

-- Opción B: Fran M 22°, Yamo 23°, Teto 24°, Toti 25°
-- UPDATE event_results SET position = 22 WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf' AND player_id = 'franm';
-- UPDATE event_results SET position = 23 WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf' AND player_id = 'yamo';
-- UPDATE event_results SET position = 24 WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf' AND player_id = 'teto';
-- UPDATE event_results SET position = 25 WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf' AND player_id = 'toti';

-- Recalcular puntos para todas las filas del evento usando el nuevo total (25).
-- Reglas: 1°=16, 2°=10, 3°=7, 4°=4, 5°=2, 6-9°=1, 10° a 24°=0.5, 25°=-0.5.
UPDATE event_results
SET points = CASE
  WHEN position = 1 THEN 16
  WHEN position = 2 THEN 10
  WHEN position = 3 THEN 7
  WHEN position = 4 THEN 4
  WHEN position = 5 THEN 2
  WHEN position BETWEEN 6 AND 9 THEN 1
  WHEN position = 25 THEN -0.5
  WHEN position BETWEEN 10 AND 24 THEN 0.5
  ELSE 0
END
WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf';

-- Verificación final.
SELECT player_id, position, points
FROM event_results
WHERE event_id = '3c231ebf-2f22-400d-8bce-c19931424abf'
ORDER BY position;

-- Si todo se ve bien:
-- COMMIT;
-- Si algo está mal:
-- ROLLBACK;
