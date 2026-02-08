import useSWR from 'swr'
import { supabase } from '../lib/supabase'

export interface PlayerCard {
  id: string
  name: string
  nickname?: string
  avatarUrl?: string
  memberSince: string | null
  golds: number
  silvers: number
  bronzes: number
  medals: number
  finalSevenTitles: number
}

const MIN_PRESENCES = 30

function formatMemberSince(dateStr: string | null): string | null {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('es-AR', {
    month: 'short',
    year: 'numeric',
  })
}

async function fetchPlayers(): Promise<PlayerCard[]> {
  // Fetch player stats + HOF titles in parallel
  const [viewResult, hofResult] = await Promise.all([
    supabase
      .from('player_complete_stats')
      .select('player_id, player_name, avatar_url, total_events, golds, silvers, bronzes, member_since')
      .gte('total_events', MIN_PRESENCES)
      .order('player_name'),
    supabase
      .from('hall_of_fame')
      .select('player_id')
      .eq('tournament_type', 'final_seven'),
  ])

  // Build HOF count map
  const hofMap = new Map<string, number>()
  if (!hofResult.error && hofResult.data) {
    for (const row of hofResult.data) {
      const pid = row.player_id as string
      hofMap.set(pid, (hofMap.get(pid) ?? 0) + 1)
    }
  }

  if (!viewResult.error && viewResult.data?.length) {
    return viewResult.data.map((p) => {
      const golds = Number(p.golds) || 0
      const silvers = Number(p.silvers) || 0
      const bronzes = Number(p.bronzes) || 0
      return {
        id: p.player_id,
        name: p.player_name,
        avatarUrl: p.avatar_url ?? undefined,
        memberSince: formatMemberSince(p.member_since),
        golds,
        silvers,
        bronzes,
        medals: golds + silvers + bronzes,
        finalSevenTitles: hofMap.get(p.player_id) ?? 0,
      }
    })
  }

  // Fallback to original logic
  console.warn('player_complete_stats view not found, using fallback query')

  const { data, error: fetchError } = await supabase
    .from('players')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (fetchError) throw fetchError
  if (!data) return []

  // Count presences and medals per player
  const perPlayer = new Map<string, { events: number; golds: number; silvers: number; bronzes: number }>()
  const pageSize = 1000
  let from = 0

  while (true) {
    const { data: results, error: resultsError } = await supabase
      .from('event_results')
      .select('player_id, position')
      .range(from, from + pageSize - 1)

    if (resultsError) throw resultsError
    if (!results || results.length === 0) break

    for (const row of results) {
      const pid = row.player_id as string
      const current = perPlayer.get(pid) ?? { events: 0, golds: 0, silvers: 0, bronzes: 0 }
      current.events++
      if (row.position === 1) current.golds++
      if (row.position === 2) current.silvers++
      if (row.position === 3) current.bronzes++
      perPlayer.set(pid, current)
    }

    if (results.length < pageSize) break
    from += pageSize
  }

  return data
    .filter((p) => (perPlayer.get(p.id)?.events ?? 0) >= MIN_PRESENCES)
    .map((p) => {
      const stats = perPlayer.get(p.id) ?? { events: 0, golds: 0, silvers: 0, bronzes: 0 }
      return {
        id: p.id,
        name: p.name,
        nickname: p.nickname ?? undefined,
        avatarUrl: p.avatar_url ?? undefined,
        memberSince: null,
        golds: stats.golds,
        silvers: stats.silvers,
        bronzes: stats.bronzes,
        medals: stats.golds + stats.silvers + stats.bronzes,
        finalSevenTitles: hofMap.get(p.id) ?? 0,
      }
    })
}

export function usePlayers() {
  const { data, error, isLoading } = useSWR('players', fetchPlayers, {
    revalidateOnFocus: false,
  })

  return {
    players: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
