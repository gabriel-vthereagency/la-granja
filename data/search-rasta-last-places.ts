/**
 * Busca todas las fechas en las que Rasta salió último en un evento.
 *
 * "Último" = posición máxima registrada en ese evento (la que otorga -0.5 pts).
 *
 * Cómo correr:
 *   VITE_SUPABASE_URL=https://xxx.supabase.co VITE_SUPABASE_ANON_KEY=yyy tsx data/search-rasta-last-places.ts
 *
 * O con la service role key para evitar restricciones de RLS:
 *   VITE_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=yyy tsx data/search-rasta-last-places.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (o SUPABASE_SERVICE_ROLE_KEY)')
  console.error('Ejemplo: VITE_SUPABASE_URL=https://xxx.supabase.co VITE_SUPABASE_ANON_KEY=yyy tsx data/search-rasta-last-places.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function searchRastaLastPlaces() {
  console.log('Buscando fechas en las que Rasta salió último...\n')

  // 1. Traer todos los resultados de Rasta con datos del evento
  const { data: rastaResults, error: rastaErr } = await supabase
    .from('event_results')
    .select('id, position, points, event_id, event_nights(id, date, number, season_id, seasons(name, year, type))')
    .eq('player_id', 'rasta')
    .order('event_id')

  if (rastaErr || !rastaResults) {
    console.error('Error al buscar resultados de Rasta:', rastaErr?.message)
    process.exit(1)
  }

  console.log(`Rasta participó en ${rastaResults.length} evento(s) en total.\n`)

  // 2. Para cada evento donde participó Rasta, buscar la posición máxima
  const rastaLastPlaces: Array<{
    date: string
    eventNumber: number
    seasonName: string
    position: number
    points: number
  }> = []

  for (const result of rastaResults) {
    if (!result.position || result.position <= 0) continue

    const eventId = result.event_id

    // Buscar la posición máxima en ese evento
    const { data: maxData, error: maxErr } = await supabase
      .from('event_results')
      .select('position')
      .eq('event_id', eventId)
      .gt('position', 0)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    if (maxErr || !maxData) continue

    const maxPosition = maxData.position

    // Verificar si Rasta tuvo la posición máxima (último lugar)
    if (result.position === maxPosition && maxPosition > 1) {
      const night = result.event_nights as any
      const season = night?.seasons as any
      rastaLastPlaces.push({
        date: night?.date ?? 'desconocida',
        eventNumber: night?.number ?? 0,
        seasonName: season ? `${season.name ?? season.type} ${season.year}` : 'Temporada desconocida',
        position: result.position,
        points: result.points ?? 0,
      })
    }
  }

  // 3. Mostrar resultados
  if (rastaLastPlaces.length === 0) {
    console.log('Rasta nunca salió último en ningún evento registrado.')
    return
  }

  console.log(`Rasta salió último en ${rastaLastPlaces.length} evento(s):\n`)
  console.log('─'.repeat(60))

  for (const lp of rastaLastPlaces) {
    console.log(`  📅 Fecha:      ${lp.date}`)
    console.log(`  🏆 Temporada:  ${lp.seasonName}`)
    console.log(`  #️⃣  Evento:     Fecha ${lp.eventNumber}`)
    console.log(`  📍 Posición:   ${lp.position}º (último)`)
    console.log(`  🎯 Puntos:     ${lp.points}`)
    console.log('─'.repeat(60))
  }

  console.log(`\nTotal: ${rastaLastPlaces.length} último(s) lugar(es)`)
}

searchRastaLastPlaces().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
