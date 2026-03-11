/**
 * Fix: dos jugadores con último lugar en Apertura 2026 Fecha 1
 *
 * Este script corrige los puntos de dos jugadores que quedaron con -0.5
 * (penalización de último lugar) cuando debería haber sido solo uno.
 *
 * Cómo correr:
 *   node --env-file=apps/web/.env.local -e "import('./data/fix-apertura-1-last-place.ts')"
 *   # o con tsx:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx VITE_SUPABASE_URL=xxx tsx data/fix-apertura-1-last-place.ts
 *
 * Requiere:
 *   - VITE_SUPABASE_URL  (en tu .env.local del proyecto)
 *   - SUPABASE_SERVICE_ROLE_KEY  (en tu dashboard de Supabase > Settings > API)
 *     Si no lo tenés, usá VITE_SUPABASE_ANON_KEY (puede fallar por RLS)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno: VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixDuplicateLastPlace() {
  console.log('Buscando Apertura 2026, Fecha 1...')

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

  // 2. Buscar la fecha 1 de esa temporada
  const { data: event, error: eventErr } = await supabase
    .from('event_nights')
    .select('id, number, date')
    .eq('season_id', season.id)
    .eq('number', 1)
    .single()

  if (eventErr || !event) {
    console.error('No se encontró la Fecha 1:', eventErr?.message)
    process.exit(1)
  }
  console.log(`Fecha 1: ${event.date} (${event.id})`)

  // 3. Buscar los resultados de esa fecha
  const { data: results, error: resultsErr } = await supabase
    .from('event_results')
    .select('id, player_id, position, points')
    .eq('event_id', event.id)
    .order('position', { ascending: false })

  if (resultsErr || !results) {
    console.error('Error al buscar resultados:', resultsErr?.message)
    process.exit(1)
  }

  console.log(`\nResultados de la fecha (${results.length} jugadores):`)
  for (const r of results) {
    console.log(`  pos=${r.position}  pts=${r.points}  player=${r.player_id}`)
  }

  // 4. Encontrar la posición máxima
  const maxPosition = Math.max(...results.map((r) => r.position ?? 0))
  const atLastPlace = results.filter((r) => r.position === maxPosition)

  if (atLastPlace.length <= 1) {
    console.log(`\nNo hay duplicado en el último lugar (pos=${maxPosition}). Nada que corregir.`)
    return
  }

  console.log(`\nProblema encontrado: ${atLastPlace.length} jugadores en posición ${maxPosition}:`)
  for (const r of atLastPlace) {
    console.log(`  player=${r.player_id}  puntos actuales=${r.points}`)
  }

  // 5. Corregir: cambiar de -0.5 a 0.5 (presencial en lugar de último)
  const idsToFix = atLastPlace.map((r) => r.id)
  const { error: updateErr } = await supabase
    .from('event_results')
    .update({ points: 0.5 })
    .in('id', idsToFix)

  if (updateErr) {
    console.error('\nError al actualizar (¿falta SUPABASE_SERVICE_ROLE_KEY?):', updateErr.message)
    process.exit(1)
  }

  console.log(`\nCorregido! ${atLastPlace.length} jugadores actualizados: -0.5 → 0.5 pts`)
  console.log('Los jugadores afectados:')
  for (const r of atLastPlace) {
    console.log(`  ${r.player_id}: ${r.points} → 0.5 pts`)
  }
}

fixDuplicateLastPlace().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
