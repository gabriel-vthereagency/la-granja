# Recalcular posiciones cuando cambia el roster — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar la posibilidad de posiciones duplicadas o congeladas cuando se agrega o se da de baja un jugador después de iniciado el torneo.

**Architecture:** Se introduce la columna `elimination_order` en `live_tournament_players` como fuente de verdad inmutable. Una función SQL `recalc_positions(tournament_state_id)` reescribe la columna `position` derivada (`total - elimination_order + 1`). Todas las operaciones que cambian el roster (eliminate, add, remove, revert) corren por RPCs que llaman al recálculo en la misma transacción. El cliente del Control deja de hacer INSERT/DELETE directo y pasa a usar las RPCs.

**Tech Stack:** Postgres (Supabase), TypeScript, React (apps/control), `packages/core` para lógica de puntos.

---

## File Structure

- **Create:** `supabase/migrations/015_elimination_order.sql` — columna nueva + función `recalc_positions` + RPCs `eliminate_player` (reescrita), `add_player`, `remove_player`, `revert_elimination`.
- **Create:** `supabase/migrations/016_audit_event_results.sql` — vista de auditoría (read-only) que lista eventos con posiciones duplicadas o gaps.
- **Create:** `data/fix-fecha9-positions.sql` — script puntual para reparar la Fecha 9 Apertura (parametrizado, se corre a mano).
- **Modify:** `apps/control/src/hooks/useTournamentControl.ts` — `addPlayer`, `removePlayer`, `revertElimination` pasan a llamar RPCs.
- **Modify:** `packages/core/src/tournament/points.ts` — endurecer la detección de "último lugar" usando `max(position)` como fallback explícito (hoy la lógica `position === totalPlayers` es frágil ante desfasajes).
- **Modify:** `supabase/schema.sql` — reflejar la nueva columna y RPCs (es el dump declarativo del esquema, hay que mantenerlo consistente).

---

## Task 1: Migración base — columna `elimination_order` + función de recálculo

**Files:**
- Create: `supabase/migrations/015_elimination_order.sql`

- [ ] **Step 1: Crear el archivo de migración con la columna y la función `recalc_positions`**

```sql
-- Migration 015: elimination_order as source of truth for tournament positions
--
-- Problem: position was assigned at elimination time as count(active) and never
-- recalculated. When a player was added or removed after eliminations had started,
-- positions of already-eliminated players became stale, producing duplicate
-- positions and a wrong "last place" assignment.
--
-- Solution: store elimination_order (1 = first eliminated, immutable). Recompute
-- position = total - elimination_order + 1 on every roster change.

-- 1. New column + unique index to prevent two players with the same order in a tournament.
ALTER TABLE live_tournament_players
  ADD COLUMN IF NOT EXISTS elimination_order integer;

CREATE UNIQUE INDEX IF NOT EXISTS idx_live_players_order_per_tournament
  ON live_tournament_players (tournament_state_id, elimination_order)
  WHERE elimination_order IS NOT NULL;

-- 2. Helper function: recalculate position for all eliminated players in a tournament.
--    Caller is responsible for holding the appropriate FOR UPDATE locks.
CREATE OR REPLACE FUNCTION recalc_positions(p_tournament_state_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_total integer;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM live_tournament_players
  WHERE tournament_state_id = p_tournament_state_id;

  UPDATE live_tournament_players
  SET position = v_total - elimination_order + 1
  WHERE tournament_state_id = p_tournament_state_id
    AND elimination_order IS NOT NULL;
END;
$$;
```

- [ ] **Step 2: Aplicar la migración localmente**

Run: `pnpm supabase db push` (o el comando que uses para aplicar migraciones).
Expected: la migración se aplica sin errores; la columna `elimination_order` aparece en `live_tournament_players`.

Verificar:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'live_tournament_players' AND column_name = 'elimination_order';
```
Expected: una fila con `elimination_order` / `integer`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/015_elimination_order.sql
git commit -m "Add elimination_order column and recalc_positions helper"
```

---

## Task 2: Reescribir `eliminate_player` para usar `elimination_order`

**Files:**
- Modify: `supabase/migrations/015_elimination_order.sql` (mismo archivo, agregar al final)

- [ ] **Step 1: Agregar la nueva versión de `eliminate_player` al final de la migración**

```sql
-- 3. Rewrite eliminate_player to use elimination_order + recalc_positions.
--    Returns the position now assigned to the player (after recalc).
CREATE OR REPLACE FUNCTION eliminate_player(p_player_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_tournament_state_id uuid;
  v_next_order integer;
  v_assigned_position integer;
BEGIN
  SELECT tournament_state_id INTO v_tournament_state_id
  FROM live_tournament_players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_tournament_state_id IS NULL THEN
    RAISE EXCEPTION 'Player % not found', p_player_id;
  END IF;

  -- Lock all rows in this tournament so concurrent eliminations / adds / removes
  -- on the same tournament serialize through this RPC.
  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id
  FOR UPDATE;

  -- Next elimination_order: 1 if first eliminated, else max+1.
  SELECT COALESCE(MAX(elimination_order), 0) + 1 INTO v_next_order
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id;

  UPDATE live_tournament_players
  SET status = 'eliminated',
      elimination_order = v_next_order
  WHERE id = p_player_id
    AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player % is not active (already eliminated or removed)', p_player_id;
  END IF;

  PERFORM recalc_positions(v_tournament_state_id);

  SELECT position INTO v_assigned_position
  FROM live_tournament_players
  WHERE id = p_player_id;

  RETURN v_assigned_position;
END;
$$;
```

- [ ] **Step 2: Aplicar la migración actualizada**

Run: `pnpm supabase db push`
Expected: la función `eliminate_player` queda reescrita sin errores.

Verificar manualmente con un torneo de prueba:
```sql
-- Setup: crear un tournament_state + 3 jugadores activos en una base de prueba.
-- Luego:
SELECT eliminate_player('<uuid_jugador_1>');
SELECT eliminate_player('<uuid_jugador_2>');
SELECT id, status, elimination_order, position
FROM live_tournament_players
WHERE tournament_state_id = '<uuid_state>'
ORDER BY position NULLS FIRST;
```
Expected: jugador 1 con `elimination_order=1, position=3`. Jugador 2 con `elimination_order=2, position=2`. Jugador activo con `position=NULL`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/015_elimination_order.sql
git commit -m "Rewrite eliminate_player to use elimination_order"
```

---

## Task 3: RPCs `add_player`, `remove_player`, `revert_elimination`

**Files:**
- Modify: `supabase/migrations/015_elimination_order.sql` (agregar al final)

- [ ] **Step 1: Agregar las tres RPCs**

```sql
-- 4. add_player RPC: inserta un jugador y recalcula posiciones de los eliminados.
CREATE OR REPLACE FUNCTION add_player(
  p_tournament_state_id uuid,
  p_player_id text,
  p_name text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_id uuid;
BEGIN
  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = p_tournament_state_id
  FOR UPDATE;

  INSERT INTO live_tournament_players (
    tournament_state_id, player_id, name, status, has_rebuy
  ) VALUES (
    p_tournament_state_id, p_player_id, p_name, 'active', false
  )
  RETURNING id INTO v_new_id;

  PERFORM recalc_positions(p_tournament_state_id);

  RETURN v_new_id;
END;
$$;

-- 5. remove_player RPC: borra un jugador y recalcula posiciones.
--    Solo permitido si el jugador está activo (un eliminado no debería borrarse).
CREATE OR REPLACE FUNCTION remove_player(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_tournament_state_id uuid;
  v_status text;
BEGIN
  SELECT tournament_state_id, status INTO v_tournament_state_id, v_status
  FROM live_tournament_players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_tournament_state_id IS NULL THEN
    RAISE EXCEPTION 'Player % not found', p_player_id;
  END IF;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'Cannot remove eliminated player % (use revert_elimination first)', p_player_id;
  END IF;

  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id
  FOR UPDATE;

  DELETE FROM live_tournament_players WHERE id = p_player_id;

  PERFORM recalc_positions(v_tournament_state_id);
END;
$$;

-- 6. revert_elimination RPC: deshace una eliminación.
--    El jugador vuelve a 'active', se le quita elimination_order y position.
--    Los demás eliminados conservan su elimination_order pero su position se
--    recalcula con el nuevo total efectivo (los activos no afectan el cálculo
--    porque elimination_order es NULL para ellos, pero sí afectan v_total).
CREATE OR REPLACE FUNCTION revert_elimination(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_tournament_state_id uuid;
  v_reverted_order integer;
BEGIN
  SELECT tournament_state_id, elimination_order
  INTO v_tournament_state_id, v_reverted_order
  FROM live_tournament_players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_tournament_state_id IS NULL THEN
    RAISE EXCEPTION 'Player % not found', p_player_id;
  END IF;

  IF v_reverted_order IS NULL THEN
    RAISE EXCEPTION 'Player % is not eliminated', p_player_id;
  END IF;

  PERFORM id
  FROM live_tournament_players
  WHERE tournament_state_id = v_tournament_state_id
  FOR UPDATE;

  -- Quitar al jugador del orden de eliminación y compactar los órdenes mayores
  -- (los que se eliminaron DESPUÉS bajan 1 puesto en el orden).
  UPDATE live_tournament_players
  SET status = 'active',
      position = NULL,
      elimination_order = NULL
  WHERE id = p_player_id;

  UPDATE live_tournament_players
  SET elimination_order = elimination_order - 1
  WHERE tournament_state_id = v_tournament_state_id
    AND elimination_order > v_reverted_order;

  PERFORM recalc_positions(v_tournament_state_id);
END;
$$;
```

- [ ] **Step 2: Aplicar la migración**

Run: `pnpm supabase db push`

Verificación manual:
```sql
-- Escenario: 3 activos, eliminar 1 (pos=3), agregar otro, verificar.
SELECT eliminate_player('<uuid_jugador_a>');
SELECT add_player('<uuid_state>', 'someplayer', 'Test');
SELECT id, status, elimination_order, position
FROM live_tournament_players
WHERE tournament_state_id = '<uuid_state>'
ORDER BY position NULLS LAST;
```
Expected: jugador_a tenía `position=3` antes del add. Después del add, total pasa de 3 a 4, jugador_a queda con `position=4`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/015_elimination_order.sql
git commit -m "Add RPCs for add/remove/revert with position recalc"
```

---

## Task 4: Backfill de `elimination_order` para torneos en curso

**Files:**
- Modify: `supabase/migrations/015_elimination_order.sql` (agregar al final)

- [ ] **Step 1: Agregar el backfill al final de la migración**

```sql
-- 7. Backfill elimination_order for eliminated players in any in-progress tournament.
--    Strategy: derive elimination_order from the current `position` column,
--    inverting the formula: elimination_order = (total_in_tournament) - position + 1.
--    This is best-effort: if positions are already corrupted (duplicates, gaps),
--    the backfill will reflect that corruption. Live tournaments should be empty
--    at deploy time anyway (the bug only manifests during a tournament).
WITH totals AS (
  SELECT tournament_state_id, COUNT(*) AS total
  FROM live_tournament_players
  GROUP BY tournament_state_id
)
UPDATE live_tournament_players p
SET elimination_order = totals.total - p.position + 1
FROM totals
WHERE p.tournament_state_id = totals.tournament_state_id
  AND p.status = 'eliminated'
  AND p.position IS NOT NULL
  AND p.elimination_order IS NULL;
```

- [ ] **Step 2: Aplicar y verificar**

Run: `pnpm supabase db push`

Verificación: si no hay torneo en curso, debería actualizar 0 filas (no es un error). Si hay, todos los eliminados deben tener `elimination_order` no nulo y único por torneo.

```sql
SELECT tournament_state_id, COUNT(*) AS eliminated_without_order
FROM live_tournament_players
WHERE status = 'eliminated' AND elimination_order IS NULL
GROUP BY tournament_state_id;
```
Expected: 0 filas.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/015_elimination_order.sql
git commit -m "Backfill elimination_order from existing position values"
```

---

## Task 5: Cliente del Control — usar las nuevas RPCs

**Files:**
- Modify: `apps/control/src/hooks/useTournamentControl.ts:307-360` (`addPlayer`, `removePlayer`)
- Modify: `apps/control/src/hooks/useTournamentControl.ts:466-486` (`revertElimination`)

- [ ] **Step 1: Reemplazar `addPlayer` para usar la RPC**

Reemplazar el bloque entre las líneas 307 y 342 por:

```typescript
const addPlayer = useCallback(async (player: LivePlayer) => {
  if (!stateIdRef.current) return

  try {
    const { data: newId, error: rpcError } = await supabase
      .rpc('add_player', {
        p_tournament_state_id: stateIdRef.current,
        p_player_id: player.playerId,
        p_name: player.name,
      })

    if (rpcError) throw rpcError

    if (newId) {
      const newPlayer: LivePlayer = {
        id: newId as string,
        playerId: player.playerId,
        name: player.name,
        status: 'active',
        position: null,
        hasRebuy: false,
      }
      setState((prev) => ({
        ...prev,
        players: [...prev.players, newPlayer],
      }))
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error adding player')
  }
}, [])
```

- [ ] **Step 2: Reemplazar `removePlayer` para usar la RPC**

Reemplazar el bloque entre las líneas 344 y 360 por:

```typescript
const removePlayer = useCallback(async (id: string) => {
  try {
    const { error: rpcError } = await supabase
      .rpc('remove_player', { p_player_id: id })

    if (rpcError) throw rpcError

    setState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
    }))
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error removing player')
  }
}, [])
```

- [ ] **Step 3: Reemplazar `revertElimination` para usar la RPC**

Reemplazar el bloque entre las líneas 466 y 486 por:

```typescript
const revertElimination = useCallback(async (id: string) => {
  try {
    const { error: rpcError } = await supabase
      .rpc('revert_elimination', { p_player_id: id })

    if (rpcError) throw rpcError

    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === id
          ? { ...p, status: 'active' as const, position: null }
          : p
      ),
    }))
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error reverting elimination')
  }
}, [])
```

Nota: la suscripción realtime de `playersChannel` (línea 137-154) hace `loadPlayers()` ante cualquier cambio en `live_tournament_players`. Como el recálculo actualiza la columna `position` de varias filas en la misma transacción, el cliente verá un evento `UPDATE` por cada fila modificada y refrescará el estado completo desde el servidor. Eso ya cubre la consistencia visual sin necesidad de tocar más cosas en el hook.

- [ ] **Step 4: Tipechecking**

Run: `pnpm --filter @lagranja/control typecheck` (o `pnpm -r typecheck`).
Expected: sin errores.

- [ ] **Step 5: Smoke test manual en el navegador**

1. Levantar Control (`pnpm --filter @lagranja/control dev`).
2. Crear un torneo con 4 jugadores, eliminar 2, agregar un quinto, verificar que el primero eliminado ahora figura con `position=5` (no `position=4`).
3. Eliminar un activo más, agregar un sexto, verificar nuevamente.

- [ ] **Step 6: Commit**

```bash
git add apps/control/src/hooks/useTournamentControl.ts
git commit -m "Control client uses add_player/remove_player/revert_elimination RPCs"
```

---

## Task 6: Endurecer la lógica de "último lugar" en `points.ts`

**Files:**
- Modify: `packages/core/src/tournament/points.ts`

- [ ] **Step 1: Agregar una variante `getPointsForResults` que detecte el último por `max(position)`**

Reemplazar el contenido completo del archivo por:

```typescript
import {
  FIXED_POINTS,
  ATTENDANCE_POINTS,
  LAST_PLACE_PENALTY,
} from '@lagranja/types'

/**
 * Calcula los puntos para una posición dada.
 *
 * Sistema de puntos:
 * - 1°: 16 puntos
 * - 2°: 10 puntos
 * - 3°: 7 puntos
 * - 4°: 4 puntos
 * - 5°: 2 puntos
 * - 6° a 9°: 1 punto (mesa final)
 * - 10° a n-1: 0.5 puntos (presencial)
 * - n (último): -0.5 puntos (penalización)
 */
export function getPointsForPosition(
  position: number,
  totalPlayers?: number
): number {
  const fixedPoints = FIXED_POINTS[position]
  if (fixedPoints !== undefined) {
    return fixedPoints
  }

  if (!totalPlayers) {
    return 0
  }

  if (position === totalPlayers) {
    return LAST_PLACE_PENALTY
  }

  if (position >= 10 && position < totalPlayers) {
    return ATTENDANCE_POINTS
  }

  return 0
}

/**
 * Calcula los puntos para una lista de resultados de un evento.
 *
 * Recibe las posiciones reales tal como quedaron tras todos los cambios de roster.
 * Detecta el último lugar como `max(position)` entre los resultados, no por
 * igualdad con `totalPlayers`. Esto evita que un desfasaje entre el total y la
 * posición máxima haga perder la penalización.
 *
 * Si dos o más jugadores comparten la posición máxima (empate en último),
 * ninguno recibe la penalización: quedan como presencial.
 */
export function getPointsForResults(
  positions: number[]
): Map<number, number> {
  const result = new Map<number, number>()
  if (positions.length === 0) return result

  const maxPosition = Math.max(...positions)
  const occurrencesOfMax = positions.filter((p) => p === maxPosition).length
  const hasTieAtLast = occurrencesOfMax > 1
  // Si no hay empate, el último es maxPosition. Si hay empate, los empatados
  // se tratan como presencial: pasamos totalPlayers = maxPosition + 1 para que
  // la fórmula `position === totalPlayers` nunca matchee.
  const totalForPoints = hasTieAtLast ? maxPosition + 1 : maxPosition

  for (const position of positions) {
    result.set(position, getPointsForPosition(position, totalForPoints))
  }
  return result
}

/**
 * Calcula los puntos para todas las posiciones de un torneo (1..totalPlayers).
 * Utilidad para tablas de referencia.
 */
export function calculateAllPoints(
  totalPlayers: number
): Array<{ position: number; points: number }> {
  const results: Array<{ position: number; points: number }> = []
  for (let pos = 1; pos <= totalPlayers; pos++) {
    results.push({ position: pos, points: getPointsForPosition(pos, totalPlayers) })
  }
  return results
}
```

- [ ] **Step 2: Reemplazar el cálculo de puntos en `saveResults` por la nueva función**

En `apps/control/src/hooks/useTournamentControl.ts`, ajustar el bloque de `saveResults` (líneas 542-589) para usar `getPointsForResults`. Reemplazar desde la línea de `playersWithPositions` hasta justo antes del `upsert`:

```typescript
const playersWithPositions = state.players
  .filter((p) => p.position !== null)
  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

const prizeBreakdown = calculatePrizePool(
  state.players.length,
  state.totalRebuys,
  state.buyInAmount
)

const pointsByPosition = getPointsForResults(
  playersWithPositions.map((p) => p.position ?? 0)
)

const results = playersWithPositions.map((player) => {
  const position = player.position ?? 0
  const prizeInfo = prizeBreakdown.prizes.find((p) => p.position === position)
  return {
    event_id: eventId,
    player_id: player.playerId,
    position,
    rebuys: player.hasRebuy ? 1 : 0,
    points: pointsByPosition.get(position) ?? 0,
    prize: prizeInfo?.amount ?? 0,
  }
})
```

Y agregar el import al tope del archivo (junto a los otros imports de `@lagranja/core`):

```typescript
import {
  BLIND_STRUCTURE,
  getPointsForPosition,
  getPointsForResults,
  calculatePrizePool,
  type SeasonType,
} from '@lagranja/core'
```

Si `getPointsForPosition` ya no se usa en el hook tras este cambio, eliminarlo del import. Verificar con `grep getPointsForPosition apps/control/src/hooks/useTournamentControl.ts` — si no aparece más, sacarlo.

- [ ] **Step 3: Exportar `getPointsForResults` desde el package**

Verificar `packages/core/src/index.ts` (o el archivo barrel del package). Si no exporta `getPointsForResults`, agregarlo. Buscar el export existente de `getPointsForPosition` y agregar `getPointsForResults` en el mismo lugar.

```bash
grep -n "getPointsForPosition" packages/core/src/index.ts
```

Si aparece como `export { getPointsForPosition }` o `export * from './tournament/points'`, ajustar para incluir el nuevo nombre.

- [ ] **Step 4: Tipecheck + build**

Run: `pnpm -r typecheck`
Expected: sin errores.

Run: `pnpm -r build` (si el package `core` se compila).
Expected: build limpio.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/tournament/points.ts packages/core/src/index.ts apps/control/src/hooks/useTournamentControl.ts
git commit -m "Add getPointsForResults: detect last place by max(position)"
```

---

## Task 7: Auditoría de `event_results` históricos

**Files:**
- Create: `supabase/migrations/016_audit_event_results.sql`

- [ ] **Step 1: Crear la vista de auditoría**

```sql
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
```

- [ ] **Step 2: Aplicar y consultar**

Run: `pnpm supabase db push`

```sql
SELECT * FROM event_results_audit;
```
Expected: lista de eventos con anomalías. La Fecha 9 Apertura (2026-05-05) debería aparecer con `has_duplicate_positions = true` y `has_position_gaps = true`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/016_audit_event_results.sql
git commit -m "Add event_results_audit view to surface corrupted positions"
```

---

## Task 8: Script puntual de corrección para la Fecha 9 Apertura

**Files:**
- Create: `data/fix-fecha9-positions.sql`

- [ ] **Step 1: Crear el script con la corrección manual**

El usuario nos confirmó:
- Total real de jugadores: 25 (Yeti se sumó mid-torneo).
- Toti fue el último real → debe quedar en `position = 25, points = -0.5`.
- El duplicado `#22` (Yamo / Fran M) hay que resolverlo: el orden real lo decide el usuario al momento de correr el script. El script deja ambos a mano para que el usuario elija.

```sql
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
```

- [ ] **Step 2: Verificación SIN ejecutar el UPDATE**

Abrir el script en el SQL editor de Supabase, correr SOLO el `BEGIN;` + el primer `SELECT` (verificación previa) + `ROLLBACK;`. Confirmar con el usuario qué jugador va en cada posición antes de descomentar.

- [ ] **Step 3: Commit del script (sin correrlo)**

```bash
git add data/fix-fecha9-positions.sql
git commit -m "Add manual fix script for Fecha 9 Apertura position errors"
```

(El usuario corre el script cuando confirme el orden Yamo/Fran M.)

---

## Task 9: Verificación end-to-end con escenarios reales

**Files:**
- (Sin archivos a crear — son pruebas manuales contra una base de desarrollo.)

- [ ] **Step 1: Escenario "roster estable"**

En una base de desarrollo:
1. Crear torneo con 5 jugadores.
2. Eliminar 4 en orden A, B, C, D. El campeón queda activo.
3. Verificar:
   ```sql
   SELECT name, status, elimination_order, position
   FROM live_tournament_players
   WHERE tournament_state_id = '<id>'
   ORDER BY position NULLS FIRST;
   ```
   Expected: A → order=1, pos=5. B → order=2, pos=4. C → order=3, pos=3. D → order=4, pos=2. Campeón → order=NULL, pos=NULL.

- [ ] **Step 2: Escenario "add mid-torneo"**

1. Mismo setup: 5 jugadores, eliminar A (order=1, pos=5).
2. Agregar jugador F via Control.
3. Verificar:
   ```sql
   SELECT name, status, elimination_order, position
   FROM live_tournament_players
   WHERE tournament_state_id = '<id>'
   ORDER BY position NULLS FIRST;
   ```
   Expected: A → order=1, **pos=6** (total ahora es 6). F → order=NULL, pos=NULL.

- [ ] **Step 3: Escenario "remove mid-torneo"**

1. Mismo setup: 5 jugadores, eliminar A (order=1, pos=5).
2. Bajar al jugador B (activo) desde Control.
3. Verificar:
   - A → order=1, **pos=4** (total ahora es 4).
   - B no aparece en la tabla.

- [ ] **Step 4: Escenario "no duplicados con concurrencia"**

1. 5 jugadores activos, 0 eliminados.
2. Desde dos pestañas/dispositivos, eliminar dos jugadores al mismo tiempo (lo más simultáneo posible).
3. Verificar que `elimination_order` y `position` son únicos en el torneo:
   ```sql
   SELECT elimination_order, COUNT(*) FROM live_tournament_players
   WHERE tournament_state_id = '<id>' AND elimination_order IS NOT NULL
   GROUP BY elimination_order HAVING COUNT(*) > 1;
   ```
   Expected: 0 filas.

- [ ] **Step 5: Documentar el resultado**

Si los 4 escenarios pasan: bug cerrado.
Si alguno falla: anotar el escenario, qué se observó, y volver al task correspondiente. No avanzar a producción.

- [ ] **Step 6: Commit final (si aplica algún ajuste)**

Si algún test manual descubre un bug menor que se arregla durante esta task, commit con mensaje descriptivo. Si todo pasa limpio, no hay commit en esta task.

---

## Task 10: Aplicar a producción

**Files:**
- (Sin archivos — son comandos de despliegue.)

- [ ] **Step 1: Confirmar que producción tiene torneo en curso o no**

Si hay un torneo activo, esperar a que termine antes de migrar. El backfill (Task 4) está pensado para correr con torneo en cero, no en medio.

- [ ] **Step 2: Aplicar migraciones 015 y 016 en producción**

Run: `pnpm supabase db push --linked` (o el comando equivalente para producción).
Expected: ambas migraciones aplicadas sin error.

- [ ] **Step 3: Correr la vista de auditoría**

```sql
SELECT * FROM event_results_audit;
```
Confirmar con el usuario qué eventos aparecen y si quiere corregirlos todos o solo Fecha 9.

- [ ] **Step 4: Correr `data/fix-fecha9-positions.sql`**

Descomentar la opción A o B según lo que confirme el usuario. Ejecutar dentro del editor SQL de Supabase. Hacer COMMIT solo si la verificación final muestra los valores correctos.

- [ ] **Step 5: Deploy del Control**

Build y deploy del front del Control (apps/control). El usuario hace una eliminación + un add en la próxima fecha real para confirmar que todo funciona en vivo.
