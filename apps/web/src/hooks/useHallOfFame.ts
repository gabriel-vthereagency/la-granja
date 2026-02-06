import useSWR from 'swr'
import { supabase } from '../lib/supabase'

export interface HofEntry {
  id: string
  tournamentType: string
  year: number
  playerName: string
  playerId: string
  playerAvatarUrl: string | null
  seasonName: string | null
}

export interface ShameEntry {
  title: string
  playerName: string
  playerId: string
  count: number
}

interface HallOfFameData {
  champions: HofEntry[]
  shame: ShameEntry[]
}

async function fetchHallOfFame(): Promise<HallOfFameData> {
  // Fetch both in parallel
  const [hofResult, shameResult] = await Promise.all([
    supabase
      .from('hall_of_fame')
      .select('id, tournament_type, year, player_id, players(id, name, avatar_url), seasons(name)')
      .order('year', { ascending: false })
      .order('tournament_type'),
    supabase.from('hall_of_shame_stats').select('*'),
  ])

  // Process champions
  const champions: HofEntry[] = []
  if (!hofResult.error && hofResult.data) {
    for (const row of hofResult.data) {
      const player = row.players as unknown as { id: string; name: string; avatar_url: string | null } | null
      const season = row.seasons as unknown as { name: string } | null
      champions.push({
        id: row.id,
        tournamentType: row.tournament_type,
        year: row.year,
        playerName: player?.name ?? 'Desconocido',
        playerId: row.player_id,
        playerAvatarUrl: player?.avatar_url ?? null,
        seasonName: season?.name ?? null,
      })
    }
  }

  // Process shame using optimized view
  let shame: ShameEntry[] = []
  if (!shameResult.error && shameResult.data?.length) {
    const shameData = shameResult.data

    // Find top for each category
    const sortedByLastPlaces = [...shameData].sort((a, b) => Number(b.last_places) - Number(a.last_places))
    const sortedByBubbles = [...shameData].sort((a, b) => Number(b.bubbles) - Number(a.bubbles))
    const sortedBySeconds = [...shameData].sort((a, b) => Number(b.second_places) - Number(a.second_places))

    const topLastPlaces = sortedByLastPlaces[0]
    const topBubbles = sortedByBubbles[0]
    const topSeconds = sortedBySeconds[0]

    shame = [
      {
        title: 'Más últimos puestos',
        playerName: topLastPlaces?.player_name ?? '-',
        playerId: topLastPlaces?.player_id ?? '',
        count: Number(topLastPlaces?.last_places ?? 0),
      },
      {
        title: 'Más burbujas (6°)',
        playerName: topBubbles?.player_name ?? '-',
        playerId: topBubbles?.player_id ?? '',
        count: Number(topBubbles?.bubbles ?? 0),
      },
      {
        title: 'Mas segundos puestos (Heads Up)',
        playerName: topSeconds?.player_name ?? '-',
        playerId: topSeconds?.player_id ?? '',
        count: Number(topSeconds?.second_places ?? 0),
      },
    ]
  } else {
    // Fallback if view doesn't exist
    console.warn('hall_of_shame_stats view not found, using fallback')
    shame = await fetchShameDataFallback()
  }

  return { champions, shame }
}

async function fetchShameDataFallback(): Promise<ShameEntry[]> {
  const pageSize = 1000
  let from = 0
  const allResults: Array<{
    event_id: string
    player_id: string
    position: number
    is_bubble: boolean | null
    players: { id: string; name: string } | null
  }> = []

  while (true) {
    const { data: page, error: resultsError } = await supabase
      .from('event_results')
      .select('event_id, player_id, position, is_bubble, players(id, name)')
      .range(from, from + pageSize - 1)

    if (resultsError) break
    if (!page || page.length === 0) break

    const normalized = page.map((row) => ({
      ...row,
      players: Array.isArray(row.players) ? row.players[0] ?? null : row.players ?? null,
    }))
    allResults.push(...normalized)
    if (page.length < pageSize) break
    from += pageSize
  }

  if (!allResults.length) {
    return [
      { title: 'Más últimos puestos', playerName: '-', playerId: '', count: 0 },
      { title: 'Más burbujas (6°)', playerName: '-', playerId: '', count: 0 },
      { title: 'Mas segundos puestos (Heads Up)', playerName: '-', playerId: '', count: 0 },
    ]
  }

  const maxPositionByEvent = new Map<string, number>()
  for (const r of allResults) {
    const pos = Number(r.position)
    if (pos > 0) {
      const current = maxPositionByEvent.get(r.event_id) ?? 0
      if (pos > current) maxPositionByEvent.set(r.event_id, pos)
    }
  }

  const perPlayer = new Map<string, {
    name: string
    lastPlaces: number
    bubbles: number
    secondPlaces: number
  }>()

  for (const r of allResults) {
    const p = r.players as { id: string; name: string } | null
    if (!p) continue

    const current = perPlayer.get(r.player_id) ?? {
      name: p.name,
      lastPlaces: 0,
      bubbles: 0,
      secondPlaces: 0,
    }

    const pos = Number(r.position)
    const maxPos = maxPositionByEvent.get(r.event_id) ?? 0
    if (pos > 0 && pos === maxPos) current.lastPlaces += 1
    if (r.is_bubble === true) current.bubbles += 1
    if (pos === 2) current.secondPlaces += 1

    perPlayer.set(r.player_id, current)
  }

  let mostLastPlaces: ShameEntry = { title: 'Más últimos puestos', playerName: '-', playerId: '', count: 0 }
  let mostBubbles: ShameEntry = { title: 'Más burbujas (6°)', playerName: '-', playerId: '', count: 0 }
  let mostSecondPlaces: ShameEntry = { title: 'Mas segundos puestos (Heads Up)', playerName: '-', playerId: '', count: 0 }

  for (const [playerId, stats] of perPlayer) {
    if (stats.lastPlaces > mostLastPlaces.count) {
      mostLastPlaces = { title: 'Más últimos puestos', playerName: stats.name, playerId, count: stats.lastPlaces }
    }
    if (stats.bubbles > mostBubbles.count) {
      mostBubbles = { title: 'Más burbujas (6°)', playerName: stats.name, playerId, count: stats.bubbles }
    }
    if (stats.secondPlaces > mostSecondPlaces.count) {
      mostSecondPlaces = { title: 'Mas segundos puestos (Heads Up)', playerName: stats.name, playerId, count: stats.secondPlaces }
    }
  }

  return [mostLastPlaces, mostBubbles, mostSecondPlaces]
}

export function useHallOfFame() {
  const { data, error, isLoading } = useSWR('hall-of-fame', fetchHallOfFame, {
    revalidateOnFocus: false,
  })

  return {
    champions: data?.champions ?? [],
    shame: data?.shame ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
