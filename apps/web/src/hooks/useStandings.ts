import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

export interface PlayerStanding {
  position: number
  playerId: string
  player: Player
  totalPoints: number
  eventsPlayed: number
  golds: number
  silvers: number
  bronzes: number
  fourths: number
  fifths: number
  podiums: number
  lastPlaces: number
  finalTables: number
  bubbles: number
}

async function fetchStandings(seasonId: string): Promise<PlayerStanding[]> {
  // Try to use the optimized view first
  const { data: viewData, error: viewError } = await supabase
    .from('season_standings')
    .select('*')
    .eq('season_id', seasonId)
    .order('position')

  if (!viewError && viewData?.length) {
    return viewData.map((row) => ({
      position: Number(row.position),
      playerId: row.player_id,
      player: {
        id: row.player_id,
        name: row.player_name,
        nickname: row.nickname ?? undefined,
        avatarUrl: row.avatar_url ?? undefined,
        isActive: row.is_active ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      totalPoints: Number(row.total_points),
      eventsPlayed: Number(row.events_played),
      golds: Number(row.golds),
      silvers: Number(row.silvers),
      bronzes: Number(row.bronzes),
      fourths: Number(row.fourths),
      fifths: Number(row.fifths),
      podiums: Number(row.podiums),
      lastPlaces: Number(row.last_places),
      finalTables: Number(row.final_tables),
      bubbles: Number(row.bubbles),
    }))
  }

  // Fallback to original logic if view doesn't exist
  console.warn('season_standings view not found, using fallback query')

  const { data: events, error: eventsError } = await supabase
    .from('event_nights')
    .select('id')
    .eq('season_id', seasonId)
    .eq('status', 'finished')

  if (eventsError) throw eventsError
  if (!events?.length) return []

  const eventIds = events.map((e) => e.id)

  const { data: results, error: resultsError } = await supabase
    .from('event_results')
    .select('*, players(*)')
    .in('event_id', eventIds)

  if (resultsError) throw resultsError
  if (!results?.length) return []

  const playerStats = new Map<string, {
    player: Player
    points: number
    events: number
    golds: number
    silvers: number
    bronzes: number
    fourths: number
    fifths: number
    lastPlaces: number
    finalTables: number
    bubbles: number
  }>()

  const playersPerEvent = new Map<string, number>()
  for (const r of results) {
    const count = playersPerEvent.get(r.event_id) ?? 0
    playersPerEvent.set(r.event_id, Math.max(count, r.position))
  }

  for (const r of results) {
    const p = r.players as unknown as Record<string, unknown>
    const current = playerStats.get(r.player_id) ?? {
      player: {
        id: p.id as string,
        name: p.name as string,
        nickname: p.nickname as string | undefined,
        avatarUrl: p.avatar_url as string | undefined,
        isActive: p.is_active as boolean,
        createdAt: new Date(p.created_at as string),
        updatedAt: new Date(p.updated_at as string),
      },
      points: 0,
      events: 0,
      golds: 0,
      silvers: 0,
      bronzes: 0,
      fourths: 0,
      fifths: 0,
      lastPlaces: 0,
      finalTables: 0,
      bubbles: 0,
    }

    current.points += Number(r.points)
    current.events += 1

    if (r.position === 1) current.golds++
    if (r.position === 2) current.silvers++
    if (r.position === 3) current.bronzes++
    if (r.position === 4) current.fourths++
    if (r.position === 5) current.fifths++
    if ((r as Record<string, unknown>).is_bubble === true || ((r as Record<string, unknown>).is_bubble == null && r.position === 6)) current.bubbles++
    if (r.position <= 9) current.finalTables++

    const totalInEvent = playersPerEvent.get(r.event_id) ?? 0
    if (r.position === totalInEvent) current.lastPlaces++

    playerStats.set(r.player_id, current)
  }

  const standingsArray: PlayerStanding[] = []
  for (const [playerId, stats] of playerStats) {
    standingsArray.push({
      position: 0,
      playerId,
      player: stats.player,
      totalPoints: stats.points,
      eventsPlayed: stats.events,
      golds: stats.golds,
      silvers: stats.silvers,
      bronzes: stats.bronzes,
      fourths: stats.fourths,
      fifths: stats.fifths,
      podiums: stats.golds + stats.silvers + stats.bronzes + stats.fourths + stats.fifths,
      lastPlaces: stats.lastPlaces,
      finalTables: stats.finalTables,
      bubbles: stats.bubbles,
    })
  }

  standingsArray.sort((a, b) => b.totalPoints - a.totalPoints)
  standingsArray.forEach((s, i) => { s.position = i + 1 })

  return standingsArray
}

export function useStandings(seasonId: string | null) {
  const { data, error, isLoading } = useSWR(
    seasonId ? `standings-${seasonId}` : null,
    () => fetchStandings(seasonId!),
    { revalidateOnFocus: false }
  )

  return {
    standings: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
