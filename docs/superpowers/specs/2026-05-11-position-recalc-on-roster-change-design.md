# Recalcular posiciones cuando cambia el roster del torneo

## Problema

Cuando se agrega o se da de baja un jugador después de que ya hubo eliminaciones, las posiciones quedan congeladas en el valor que tenían al momento de cada eliminación. Esto produce dos síntomas:

1. **Posiciones incorrectas para el último lugar**: el jugador que en realidad terminó último no recibe la penalización de -0.5, porque su `position` quedó fijada antes de que el total de jugadores cambiara.
2. **Posiciones duplicadas**: el contador `count(active)` puede repetir un valor si el roster cambia entre dos eliminaciones consecutivas.

**Caso real (Fecha 9 Apertura, 2026-05-05)**: Yeti se anotó después de que Toti ya estaba eliminado. Toti quedó marcado como #24 con +0.5, cuando en realidad era #25 con -0.5. Yamo y Fran M aparecen ambos como #22.

## Causa raíz

`supabase/migrations/014_atomic_eliminate_player.sql` calcula `position = count(active players)` en el momento de eliminar, y eso queda escrito en `live_tournament_players.position` como valor fijo. Si después se agrega o quita un jugador, las filas ya eliminadas no se actualizan. `packages/core/src/tournament/points.ts` después usa esa posición y un `totalPlayers` que puede no coincidir, lo que rompe el cálculo de puntos.

El modelo asume que el roster es fijo desde el inicio del torneo. En la realidad de La Granja, se anota gente tarde o se baja después de empezar.

## Diseño

### Fuente de verdad

`elimination_order` (integer) en `live_tournament_players` es el dato inmutable: 1 = primero eliminado, 2 = segundo, etc. No cambia nunca una vez asignado.

`position` se mantiene como columna pero pasa a ser **derivada**: se reescribe automáticamente a partir de `elimination_order` y del total actual del torneo. La UI sigue leyendo `position` sin cambios.

Fórmula:
```
position = total_jugadores_torneo - elimination_order + 1
```

Donde `total_jugadores_torneo` = `count(*)` de `live_tournament_players` en ese torneo (activos + eliminados). Los jugadores que se bajan se eliminan físicamente de la tabla, así que el `count(*)` refleja siempre el roster real vigente.

### Cambios en el esquema

Nueva migración `015_elimination_order.sql`:

1. Agregar columna `elimination_order integer` a `live_tournament_players`.
2. Índice único parcial: `(tournament_state_id, elimination_order) WHERE elimination_order IS NOT NULL` — garantiza que no haya dos jugadores con el mismo orden en un mismo torneo.
3. Backfill: para los torneos en curso (status != finished), calcular `elimination_order` a partir de los `position` actuales (orden inverso). Para torneos ya finalizados, no se toca live state porque `event_results` ya tiene los datos.

### RPC `eliminate_player` (modificada)

Reemplaza la lógica actual:

1. Lockea las filas del torneo como hoy.
2. Calcula `v_next_order = COALESCE(MAX(elimination_order), 0) + 1` entre los eliminados.
3. Actualiza el jugador: `status = 'eliminated'`, `elimination_order = v_next_order`.
4. **Recalcula `position` de todos los eliminados del torneo** usando la fórmula con el total actual. Esto es una sola UPDATE por torneo.
5. Devuelve la `position` recién asignada al cliente (para que actualice estado local).

### Add / Remove de jugadores

Hoy no existen RPCs `add_player` / `remove_player`: el cliente hace `INSERT` / `DELETE` directo sobre `live_tournament_players`. Para garantizar la consistencia se crean dos RPCs nuevas:

- `add_player(p_tournament_state_id uuid, p_player_id text, p_name text)`: inserta la fila con `status = 'active'` y dispara el recálculo de `position` de todos los eliminados del torneo.
- `remove_player(p_player_id uuid)`: borra la fila y dispara el mismo recálculo.

Ambas operaciones se hacen dentro de la misma transacción con FOR UPDATE sobre las filas del torneo, igual que `eliminate_player`, para no chocar con eliminaciones concurrentes.

El cliente migra a usar estas RPCs en vez del INSERT/DELETE directo.

### Cierre de evento (`event_results`)

Cuando se guardan los resultados finales del evento (`Guardar Resultados`):

1. Se toma el total final de jugadores (count en `live_tournament_players` con status válido).
2. Para cada jugador eliminado, `position` ya es correcta porque la mantuvimos al día con el último recálculo.
3. `points` se calcula con `getPointsForPosition(position, totalPlayers)` usando ese total final.

Además, se arregla la lógica de último lugar en `packages/core/src/tournament/points.ts`: en vez de `position === totalPlayers`, usar `position === max(position de todos los eliminados)` o equivalente, como cinturón de seguridad por si alguna vez el total queda desfasado.

### Backfill de datos históricos

Migración `016_backfill_event_results.sql`: script SQL que recorre `event_results` y, para cada evento, recalcula `position` y `points` derivando `elimination_order` del `position` actual + total actual de filas del evento. Esto corrige la Fecha 9 (Toti pasa a #25 con -0.5, se resuelve el duplicado #22 si existe en los datos guardados).

Antes de correr el backfill: hacer dump / snapshot de `event_results` por las dudas.

## Tests

Tests de integración contra la base (no mockear DB, según convención del proyecto):

1. **Roster estable**: 24 anotados, eliminaciones secuenciales. Toti último → `position = 24`, `points = -0.5`.
2. **Add después de eliminaciones**: 24 anotados, 5 eliminaciones, se agrega Yeti, sigue el torneo, Toti es el último real → al cerrar, Toti `position = 25` con `-0.5`, Yeti recibe la posición que corresponda según su orden de eliminación.
3. **Remove de un activo**: 24 anotados, 2 eliminados, uno de los activos se baja. Total pasa a 23. Los dos ya eliminados conservan su `elimination_order`, pero su `position` se recalcula → el más reciente eliminado ahora es `position = 23` (último vigente).
4. **No duplicados**: simular dos eliminaciones rápidas seguidas de un add. Verificar que no haya dos filas con el mismo `position` ni con el mismo `elimination_order` en el torneo.

## Componentes afectados

- `supabase/migrations/015_elimination_order.sql` (nuevo)
- `supabase/migrations/016_backfill_event_results.sql` (nuevo)
- `eliminate_player` RPC (modificada)
- `add_player` / `remove_player` RPCs (nuevas o modificadas según exista server-side)
- `packages/core/src/tournament/points.ts` — hardening del check de último lugar
- Tests de integración para los 4 casos

## Lo que NO está en este diseño

- No se cambia la UI del control ni del timer.
- No se cambia el formato de `event_results` ni la API pública.
- No se introduce manejo nuevo de empates intencionales (si dos jugadores son eliminados a la vez): por ahora cada eliminación es atómica y secuencial, y el orden lo decide el operador del control. Si en el futuro se quiere modelar empates reales, se hace en otro spec.
