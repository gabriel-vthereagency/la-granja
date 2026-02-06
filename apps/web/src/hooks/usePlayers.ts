import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import type { Player } from '@lagranja/types'

const MIN_PRESENCES = 30

async function fetchPlayers(): Promise<Player[]> {
  // Try using the optimized view first
  const { data: viewData, error: viewError } = await supabase
    .from('player_complete_stats')
    .select('player_id, player_name, avatar_url, total_events')
    .gte('total_events', MIN_PRESENCES)
    .order('player_name')

  if (!viewError && viewData?.length) {
    return viewData.map((p) => ({
      id: p.player_id,
      name: p.player_name,
      nickname: undefined,
      avatarUrl: p.avatar_url ?? undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
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

  // Count presences
  const counts = new Map<string, number>()
  const pageSize = 1000
  let from = 0

  while (true) {
    const { data: presences, error: presenceError } = await supabase
      .from('event_results')
      .select('player_id')
      .range(from, from + pageSize - 1)

    if (presenceError) throw presenceError
    if (!presences || presences.length === 0) break

    for (const row of presences) {
      const pid = row.player_id as string
      counts.set(pid, (counts.get(pid) ?? 0) + 1)
    }

    if (presences.length < pageSize) break
    from += pageSize
  }

  const filtered = data.filter((p) => (counts.get(p.id) ?? 0) >= MIN_PRESENCES)

  return filtered.map((p) => ({
    id: p.id,
    name: p.name,
    nickname: p.nickname,
    avatarUrl: p.avatar_url,
    isActive: p.is_active,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  }))
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
