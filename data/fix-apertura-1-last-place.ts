/**
 * Fix: puntos incorrectos en Apertura 2026 Fecha 1
 *
 * Qué pasó:
 *   - 26 jugadores registrados
 *   - Orfa fue eliminada (pos=26, primera en salir)
 *   - Santi fue removido de la lista ("no vino") → state.players.length bajó a 25
 *   - Hernan fue eliminado (pos=25, porque había 25 activos después de remover a Santi)
 *   - Al guardar: totalPlayers=25 (incorrecto, debería ser 26 = maxPosition)
 *     → Orfa (pos=26): 26 >= 10 pero 26 < 25 es falso → 0 pts (debería ser -0.5)
 *     → Hernan (pos=25): 25 === 25 → -0.5 pts (debería ser +0.5 presencial)
 *
 * Corrección:
 *   - Orfa: 0 → -0.5 (era la verdadera última)
 *   - Hernan: -0.5 → +0.5 (era presencial, no último)
 *
 * Cómo correr:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx tsx data/fix-apertura-1-last-place.ts
 *
 * La SUPABASE_SERVICE_ROLE_KEY está en tu dashboard de Supabase → Settings → API
 * También necesitás VITE_SUPABASE_URL (en tu .env.local del proyecto)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno: VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  console.error('Ejemplo: VITE_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=yyy tsx data/fix-apertura-1-last-place.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixApertura1LastPlace() {
  console.log('Buscando Apertura 2026, Fecha 1...\n')

  // 1. Buscar la temporada apertura 2026
  const { data: season, error: seasonErr } = await supabase
    .from('seasons')
    .select('id, name')
    .eq('type', 'apertura')
    .eq('year', 2026)
    .single()

  if (seasonErr || !season) {
    console.error('No se encontró la temporada Apertura 2026:', seasonErr?.message)
    process.exit(1)
  }
  console.log(`Temporada: ${season.name} (${season.id})`)

  // 2. Buscar la fecha 1
  const { data: event, error: eventErr } = await supabase
    .from('event_nights')
    .select('id, number, date, players_count')
    .eq('season_id', season.id)
    .eq('number', 1)
    .single()

  if (eventErr || !event) {
    console.error('No se encontró la Fecha 1:', eventErr?.message)
    process.exit(1)
  }
  console.log(`Fecha 1: ${event.date} (${event.id})\n`)

  // 3. Traer todos los resultados ordenados por posición
  const { data: results, error: resultsErr } = await supabase
    .from('event_results')
    .select('id, player_id, position, points')
    .eq('event_id', event.id)
    .order('position', { ascending: false })

  if (resultsErr || !results) {
    console.error('Error al buscar resultados:', resultsErr?.message)
    process.exit(1)
  }

  console.log(`Resultados actuales (${results.length} jugadores):`)
  for (const r of results) {
    const flag = r.points < 0 ? ' ← penalizado ❌' : r.position === Math.max(...results.map(x => x.position)) ? ' ← debería ser último' : ''
    console.log(`  pos=${String(r.position).padStart(2)}  pts=${String(r.points).padStart(5)}  ${r.player_id}${flag}`)
  }

  // 4. Calcular la posición máxima (el verdadero "último lugar")
  const maxPosition = Math.max(...results.map((r) => r.position ?? 0))
  const atMaxPosition = results.filter((r) => r.position === maxPosition)
  const wronglyPenalized = results.filter((r) => r.points < 0 && r.position !== maxPosition)
  const shouldBePenalized = atMaxPosition.filter((r) => r.points >= 0)

  console.log(`\nPosición máxima (verdadero último lugar): ${maxPosition}`)

  if (wronglyPenalized.length === 0 && shouldBePenalized.length === 0) {
    console.log('Los puntos ya están correctos. Nada que corregir.')
    return
  }

  console.log('\nCorrecciones necesarias:')
  for (const r of wronglyPenalized) {
    console.log(`  ${r.player_id}: ${r.points} → +0.5 (era presencial, no último)`)
  }
  for (const r of shouldBePenalized) {
    console.log(`  ${r.player_id}: ${r.points} → -0.5 (era el verdadero último, pos=${maxPosition})`)
  }

  // 5. Aplicar correcciones
  let anyError = false

  if (wronglyPenalized.length > 0) {
    const { error: e } = await supabase
      .from('event_results')
      .update({ points: 0.5 })
      .in('id', wronglyPenalized.map((r) => r.id))
    if (e) { console.error('Error corrigiendo presencial:', e.message); anyError = true }
  }

  if (shouldBePenalized.length > 0) {
    const { error: e } = await supabase
      .from('event_results')
      .update({ points: -0.5 })
      .in('id', shouldBePenalized.map((r) => r.id))
    if (e) { console.error('Error corrigiendo último lugar:', e.message); anyError = true }
  }

  if (anyError) {
    console.error('\n¿Falta SUPABASE_SERVICE_ROLE_KEY? La anon key no puede hacer updates por RLS.')
    process.exit(1)
  }

  console.log('\n✓ Correcciones aplicadas exitosamente.')
}

fixApertura1LastPlace().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
