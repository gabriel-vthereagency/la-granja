import useSWR from 'swr'
import { supabase } from '../lib/supabase'

export interface StatsRow {
  rank: number
  player: string
  playerId?: string
  value: number
}

export interface StatsData {
  topPodiums: StatsRow[]
  topWins: StatsRow[]
  topLastPlaces: StatsRow[]
  topBubbles: StatsRow[]
  topEffectiveness: StatsRow[]
  topWinRate: StatsRow[]
  topPresences: StatsRow[]
  topRebuys: StatsRow[]
  topBounties: StatsRow[]
}

const TOP_LIMIT = 10
const MIN_EFFECTIVENESS_EVENTS = 60

async function fetchStats(): Promise<StatsData> {
  // Try optimized view first
  const { data: viewData, error: viewError } = await supabase
    .from('player_complete_stats')
    .select('*')

  if (!viewError && viewData?.length) {
    const players = viewData

    const toTop = (
      rows: Array<{ player_name: string; player_id: string; value: number }>
    ): StatsRow[] => {
      return rows
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, TOP_LIMIT)
        .map((row, index) => ({
          rank: index + 1,
          player: row.player_name,
          playerId: row.player_id,
          value: row.value,
        }))
    }

    const topPodiums = toTop(
      players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.podiums) }))
    )
    const topWins = toTop(
      players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.golds) }))
    )
    const topLastPlaces = toTop(
      players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.last_places) }))
    )
    const topBubbles = toTop(
      players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.bubbles) }))
    )
    const topPresences = toTop(
      players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.total_events) }))
    )
    const topEffectiveness = players
      .filter((p) => Number(p.total_events) >= MIN_EFFECTIVENESS_EVENTS)
      .map((p) => ({
        player_name: p.player_name,
        player_id: p.player_id,
        value: Number(p.effectiveness),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_LIMIT)
      .map((row, index) => ({
        rank: index + 1,
        player: row.player_name,
        playerId: row.player_id,
        value: row.value,
      }))

    const topWinRate = players
      .filter((p) => Number(p.total_events) >= MIN_EFFECTIVENESS_EVENTS)
      .map((p) => ({
        player_name: p.player_name,
        player_id: p.player_id,
        value: (Number(p.golds) / Number(p.total_events)) * 100,
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_LIMIT)
      .map((row, index) => ({
        rank: index + 1,
        player: row.player_name,
        playerId: row.player_id,
        value: row.value,
      }))

    // Fetch rebuys and bounties from event_results (not in the view)
    const [rebuysRes, bountiesRes] = await Promise.all([
      supabase
        .from('event_results')
        .select('player_id, rebuys, players(name)')
        .gt('rebuys', 0),
      supabase
        .from('event_results')
        .select('player_id, bounty_count, players(name)')
        .gt('bounty_count', 0),
    ])

    const aggregateByPlayer = (
      rows: Array<Record<string, unknown>>,
      valueKey: string,
    ): StatsRow[] => {
      const map = new Map<string, { name: string; total: number }>()
      for (const r of rows) {
        const pid = r.player_id as string
        const p = r.players as { name: string } | { name: string }[] | null
        const name = Array.isArray(p) ? p[0]?.name : p?.name
        if (!name) continue
        const val = Number(r[valueKey]) || 0
        const current = map.get(pid)
        if (current) {
          current.total += val
        } else {
          map.set(pid, { name, total: val })
        }
      }
      return Array.from(map.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, TOP_LIMIT)
        .map(([pid, v], i) => ({
          rank: i + 1,
          player: v.name,
          playerId: pid,
          value: v.total,
        }))
    }

    const topRebuys = aggregateByPlayer(rebuysRes.data ?? [], 'rebuys')
    const topBounties = aggregateByPlayer(bountiesRes.data ?? [], 'bounty_count')

    return {
      topPodiums,
      topWins,
      topLastPlaces,
      topBubbles,
      topEffectiveness,
      topWinRate,
      topPresences,
      topRebuys,
      topBounties,
    }
  }

  // Fallback to original logic
  console.warn('player_complete_stats view not found, using fallback query')

  const pageSize = 1000
  let from = 0
  const results: Array<{
    event_id: string
    player_id: string
    position: number
    points: number
    is_bubble: boolean | null
    players: { id: string; name: string } | { id: string; name: string }[] | null
  }> = []

  while (true) {
    const { data: page, error: resultsError } = await supabase
      .from('event_results')
      .select('event_id, player_id, position, points, is_bubble, players(id, name)')
      .range(from, from + pageSize - 1)

    if (resultsError) throw resultsError
    if (!page || page.length === 0) break

    const normalized = page.map((row) => ({
      ...row,
      players: Array.isArray(row.players) ? row.players[0] ?? null : row.players ?? null,
    }))
    results.push(...normalized)
    if (page.length < pageSize) break
    from += pageSize
  }

  if (!results.length) {
    return {
      topPodiums: [],
      topWins: [],
      topLastPlaces: [],
      topBubbles: [],
      topEffectiveness: [],
      topWinRate: [],
      topPresences: [],
      topRebuys: [],
      topBounties: [],
    }
  }

  const maxPositionByEvent = new Map<string, number>()
  for (const r of results) {
    const pos = Number(r.position)
    if (pos > 0) {
      const current = maxPositionByEvent.get(r.event_id) ?? 0
      if (pos > current) maxPositionByEvent.set(r.event_id, pos)
    }
  }

  const perPlayer = new Map<string, {
    name: string
    points: number
    events: number
    podiums: number
    wins: number
    lastPlaces: number
    bubbles: number
  }>()

  for (const r of results) {
    const p = (Array.isArray(r.players) ? r.players[0] : r.players) as { id: string; name: string } | null
    if (!p) continue
    const current = perPlayer.get(r.player_id) ?? {
      name: p.name,
      points: 0,
      events: 0,
      podiums: 0,
      wins: 0,
      lastPlaces: 0,
      bubbles: 0,
    }

    const pos = Number(r.position)
    current.points += Number(r.points)
    current.events += 1

    if (pos >= 1 && pos <= 5) current.podiums += 1
    if (pos === 1) current.wins += 1

    const maxPos = maxPositionByEvent.get(r.event_id) ?? 0
    if (pos > 0 && pos === maxPos) current.lastPlaces += 1

    if (r.is_bubble === true || (r.is_bubble == null && pos === 6)) current.bubbles += 1

    perPlayer.set(r.player_id, current)
  }

  const toTop = (rows: Array<{ name: string; value: number }>) => {
    const sorted = rows
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_LIMIT)
    return sorted.map((row, index) => ({
      rank: index + 1,
      player: row.name,
      value: row.value,
    }))
  }

  const topPodiums = toTop(
    Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.podiums }))
  )
  const topWins = toTop(
    Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.wins }))
  )
  const topLastPlaces = toTop(
    Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.lastPlaces }))
  )
  const topBubbles = toTop(
    Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.bubbles }))
  )
  const topPresences = toTop(
    Array.from(perPlayer.values()).map((p) => ({ name: p.name, value: p.events }))
  )
  const topEffectiveness = Array.from(perPlayer.values())
    .filter((p) => p.events >= MIN_EFFECTIVENESS_EVENTS)
    .map((p) => ({ name: p.name, value: p.points / p.events }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_LIMIT)
    .map((row, index) => ({
      rank: index + 1,
      player: row.name,
      value: row.value,
    }))
  const topWinRate = Array.from(perPlayer.values())
    .filter((p) => p.events >= MIN_EFFECTIVENESS_EVENTS)
    .map((p) => ({ name: p.name, value: (p.wins / p.events) * 100 }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_LIMIT)
    .map((row, index) => ({
      rank: index + 1,
      player: row.name,
      value: row.value,
    }))

  return {
    topPodiums,
    topWins,
    topLastPlaces,
    topBubbles,
    topEffectiveness,
    topWinRate,
    topPresences,
    topRebuys: [],
    topBounties: [],
  }
}

const EMPTY_STATS: StatsData = {
  topPodiums: [],
  topWins: [],
  topLastPlaces: [],
  topBubbles: [],
  topEffectiveness: [],
  topWinRate: [],
  topPresences: [],
  topRebuys: [],
  topBounties: [],
}

const MIN_SEASON_EFFECTIVENESS_EVENTS = 5

async function fetchSeasonStats(seasonId: string): Promise<StatsData> {
  // Use player_season_stats view filtered by season
  const [seasonStatsRes, lastPlacesRes, rebuysRes, bountiesRes] = await Promise.all([
    supabase
      .from('player_season_stats')
      .select('*')
      .eq('season_id', seasonId),
    supabase
      .from('player_season_last_places')
      .select('*')
      .eq('season_id', seasonId),
    supabase
      .from('event_results')
      .select('player_id, rebuys, players(name), event_nights!inner(season_id)')
      .eq('event_nights.season_id', seasonId)
      .gt('rebuys', 0),
    supabase
      .from('event_results')
      .select('player_id, bounty_count, players(name), event_nights!inner(season_id)')
      .eq('event_nights.season_id', seasonId)
      .gt('bounty_count', 0),
  ])

  if (seasonStatsRes.error || !seasonStatsRes.data?.length) return EMPTY_STATS

  const players = seasonStatsRes.data

  // Build last_places map from the view
  const lastPlacesMap = new Map<string, number>()
  for (const lp of lastPlacesRes.data ?? []) {
    lastPlacesMap.set(lp.player_id, Number(lp.last_places))
  }

  const toTop = (
    rows: Array<{ player_name: string; player_id: string; value: number }>
  ): StatsRow[] => {
    return rows
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_LIMIT)
      .map((row, index) => ({
        rank: index + 1,
        player: row.player_name,
        playerId: row.player_id,
        value: row.value,
      }))
  }

  const topPodiums = toTop(
    players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.podiums) }))
  )
  const topWins = toTop(
    players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.golds) }))
  )
  const topLastPlaces = toTop(
    players.map((p) => ({
      player_name: p.player_name,
      player_id: p.player_id,
      value: lastPlacesMap.get(p.player_id) ?? 0,
    }))
  )
  const topBubbles = toTop(
    players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.bubbles) }))
  )
  const topPresences = toTop(
    players.map((p) => ({ player_name: p.player_name, player_id: p.player_id, value: Number(p.events_played) }))
  )
  const topEffectiveness = players
    .filter((p) => Number(p.events_played) >= MIN_SEASON_EFFECTIVENESS_EVENTS)
    .map((p) => ({
      player_name: p.player_name,
      player_id: p.player_id,
      value: Number(p.total_points) / Number(p.events_played),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_LIMIT)
    .map((row, index) => ({
      rank: index + 1,
      player: row.player_name,
      playerId: row.player_id,
      value: row.value,
    }))

  const topWinRate = players
    .filter((p) => Number(p.events_played) >= MIN_SEASON_EFFECTIVENESS_EVENTS)
    .map((p) => ({
      player_name: p.player_name,
      player_id: p.player_id,
      value: (Number(p.golds) / Number(p.events_played)) * 100,
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_LIMIT)
    .map((row, index) => ({
      rank: index + 1,
      player: row.player_name,
      playerId: row.player_id,
      value: row.value,
    }))

  const aggregateByPlayer = (
    rows: Array<Record<string, unknown>>,
    valueKey: string,
  ): StatsRow[] => {
    const map = new Map<string, { name: string; total: number }>()
    for (const r of rows) {
      const pid = r.player_id as string
      const p = r.players as { name: string } | { name: string }[] | null
      const name = Array.isArray(p) ? p[0]?.name : p?.name
      if (!name) continue
      const val = Number(r[valueKey]) || 0
      const current = map.get(pid)
      if (current) {
        current.total += val
      } else {
        map.set(pid, { name, total: val })
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, TOP_LIMIT)
      .map(([pid, v], i) => ({
        rank: i + 1,
        player: v.name,
        playerId: pid,
        value: v.total,
      }))
  }

  const topRebuys = aggregateByPlayer(rebuysRes.data ?? [], 'rebuys')
  const topBounties = aggregateByPlayer(bountiesRes.data ?? [], 'bounty_count')

  return {
    topPodiums,
    topWins,
    topLastPlaces,
    topBubbles,
    topEffectiveness,
    topWinRate,
    topPresences,
    topRebuys,
    topBounties,
  }
}

export function useStats(seasonId: string | null = null) {
  const { data, error, isLoading } = useSWR(
    `stats-${seasonId ?? 'all'}`,
    () => seasonId ? fetchSeasonStats(seasonId) : fetchStats(),
    { revalidateOnFocus: false }
  )

  return {
    stats: data ?? EMPTY_STATS,
    loading: isLoading,
    error: error?.message ?? null,
  }
}
