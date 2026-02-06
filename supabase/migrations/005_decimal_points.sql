-- Cambiar columna points de integer a numeric para soportar decimales (0.25, -0.25)
ALTER TABLE event_results
ALTER COLUMN points TYPE numeric(5,2) USING points::numeric(5,2);

-- Actualizar default
ALTER TABLE event_results
ALTER COLUMN points SET DEFAULT 0;
