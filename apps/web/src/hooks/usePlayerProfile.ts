import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

export interface PlayerProfile {
  player: Player
  aliases: string[]
  favoriteHand: string | null
  memberSince: Date | null
  stats: {
    totalEvents: number
    totalPoints: number
    effectiveness: number
    golds: number
    silvers: number
    bronzes: number
    fourths: number
    fifths: number
    lastPlaces: number
    finalTables: number
    bubbles: number
    finalSevens: number
    fracas: number
  }
}

async function fetchPlayerProfile(playerId: string): Promise<PlayerProfile> {
  // Fetch player, aliases, and stats in parallel
  const [playerResult, aliasesResult, statsResult] = await Promise.all([
    supabase.from('players').select('*').eq('id', playerId).single(),
    supabase.from('player_aliases').select('alias').eq('player_id', playerId),
    supabase.from('player_complete_stats').select('*').eq('player_id', playerId).single(),
  ])

  if (playerResult.error) throw playerResult.error
  if (!playerResult.data) throw new Error('Player not found')

  const playerData = playerResult.data
  const aliases = aliasesResult.data?.map((a) => a.alias) ?? []

  // If we got stats from the view, use them
  if (!statsResult.error && statsResult.data) {
    const s = statsResult.data
    return {
      player: {
        id: playerData.id,
        name: playerData.name,
        nickname: playerData.nickname,
        avatarUrl: playerData.avatar_url,
        isActive: playerData.is_active,
        createdAt: new Date(playerData.created_at),
        updatedAt: new Date(playerData.updated_at),
      },
      aliases,
      favoriteHand: playerData.favorite_hand ?? null,
      memberSince: s.member_since ? new Date(s.member_since) : null,
      stats: {
        totalEvents: Number(s.total_events),
        totalPoints: Number(s.total_points),
        effectiveness: Number(s.effectiveness),
        golds: Number(s.golds),
        silvers: Number(s.silvers),
        bronzes: Number(s.bronzes),
        fourths: Number(s.fourths),
        fifths: Number(s.fifths),
        lastPlaces: Number(s.last_places),
        finalTables: Number(s.final_tables),
        bubbles: Number(s.bubbles),
        finalSevens: 0,
        fracas: 0,
      },
    }
  }

  // Fallback: calculate stats manually
  console.warn('player_complete_stats view not found, using fallback query')

  const { data: resultsData } = await supabase
    .from('event_results')
    .select('position, points, event_id, is_final_table, event_nights(date)')
    .eq('player_id', playerId)
    .order('event_nights(date)', { ascending: true })

  let totalPoints = 0
  let golds = 0
  let silvers = 0
  let bronzes = 0
  let fourths = 0
  let fifths = 0
  let lastPlaces = 0
  let finalTables = 0
  let bubbles = 0
  let memberSince: Date | null = null

  // Get max positions per event for last place calculation
  const eventIds = resultsData?.map((r) => r.event_id) ?? []
  const playersPerEvent = new Map<string, number>()

  if (eventIds.length > 0) {
    const { data: allResults } = await supabase
      .from('event_results')
      .select('event_id, position')
      .in('event_id', eventIds)

    if (allResults) {
      for (const r of allResults) {
        const count = playersPerEvent.get(r.event_id) ?? 0
        playersPerEvent.set(r.event_id, Math.max(count, r.position))
      }
    }
  }

  if (resultsData) {
    for (const r of resultsData) {
      totalPoints += Number(r.points)
      if (r.position === 1) golds++
      if (r.position === 2) silvers++
      if (r.position === 3) bronzes++
      if (r.position === 4) fourths++
      if (r.position === 5) fifths++
      if (r.position === 6) bubbles++
      // Hybrid: use explicit value if set, otherwise calculate from position
      if (r.is_final_table ?? (r.position !== null && r.position <= 9)) finalTables++

      const totalInEvent = playersPerEvent.get(r.event_id) ?? 0
      if (r.position === totalInEvent && totalInEvent > 1) lastPlaces++

      const eventData = r.event_nights as unknown as { date: string } | null
      if (eventData?.date && !memberSince) {
        memberSince = new Date(eventData.date)
      }
    }
  }

  const totalEvents = resultsData?.length ?? 0
  const effectiveness = totalEvents > 0 ? totalPoints / totalEvents : 0

  return {
    player: {
      id: playerData.id,
      name: playerData.name,
      nickname: playerData.nickname,
      avatarUrl: playerData.avatar_url,
      isActive: playerData.is_active,
      createdAt: new Date(playerData.created_at),
      updatedAt: new Date(playerData.updated_at),
    },
    aliases,
    favoriteHand: playerData.favorite_hand ?? null,
    memberSince,
    stats: {
      totalEvents,
      totalPoints,
      effectiveness,
      golds,
      silvers,
      bronzes,
      fourths,
      fifths,
      lastPlaces,
      finalTables,
      bubbles,
      finalSevens: 0,
      fracas: 0,
    },
  }
}

export function usePlayerProfile(playerId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    playerId ? `player-${playerId}` : null,
    () => fetchPlayerProfile(playerId!),
    { revalidateOnFocus: false }
  )

  return {
    profile: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  }
}
