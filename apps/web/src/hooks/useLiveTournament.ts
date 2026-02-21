import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export interface LiveTournamentData {
  isLive: boolean
  eventNumber: number
  seasonName: string
  tournamentName: string
  currentLevel: number
  timeRemaining: number
  isPaused: boolean
  gamePhase: string
  activePlayers: number
  totalPlayers: number
}

export function useLiveTournament() {
  const [data, setData] = useState<LiveTournamentData | null>(null)
  const stateIdRef = useRef<string | null>(null)

  useEffect(() => {
    let stateChannel: ReturnType<typeof supabase.channel> | null = null
    let playersChannel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      // Fetch latest tournament state
      const { data: stateRow, error } = await supabase
        .from('live_tournament_state')
        .select('*')
        .limit(1)
        .single()

      if (error || !stateRow) {
        setData(null)
        return
      }

      const isPaused = stateRow.is_paused as boolean
      const gamePhase = (stateRow.game_phase as string) ?? 'normal'

      // Only show if tournament is actively in play
      if (isPaused || gamePhase === 'champion') {
        setData(null)
        return
      }

      stateIdRef.current = stateRow.id

      // Fetch players
      const { data: playersData } = await supabase
        .from('live_tournament_players')
        .select('status')
        .eq('tournament_state_id', stateRow.id)

      const allPlayers = playersData ?? []
      const activePlayers = allPlayers.filter((p) => p.status === 'active').length

      setData({
        isLive: true,
        eventNumber: stateRow.event_number ?? 0,
        seasonName: stateRow.season_name ?? '',
        tournamentName: stateRow.tournament_name ?? '',
        currentLevel: stateRow.current_level ?? 0,
        timeRemaining: stateRow.time_remaining ?? 0,
        isPaused,
        gamePhase,
        activePlayers,
        totalPlayers: allPlayers.length,
      })

      // Subscribe to state changes
      stateChannel = supabase
        .channel('web-live-state')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'live_tournament_state',
            filter: `id=eq.${stateRow.id}`,
          },
          (payload) => {
            const s = payload.new as Record<string, unknown>
            const newPaused = s.is_paused as boolean
            const newPhase = (s.game_phase as string) ?? 'normal'

            if (newPaused || newPhase === 'champion') {
              setData(null)
              return
            }

            setData((prev) => prev ? ({
              ...prev,
              currentLevel: (s.current_level as number) ?? prev.currentLevel,
              timeRemaining: (s.time_remaining as number) ?? prev.timeRemaining,
              isPaused: newPaused,
              gamePhase: newPhase,
              eventNumber: (s.event_number as number) ?? prev.eventNumber,
              seasonName: (s.season_name as string) ?? prev.seasonName,
            }) : null)
          }
        )
        .subscribe()

      // Subscribe to player changes
      playersChannel = supabase
        .channel('web-live-players')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'live_tournament_players',
            filter: `tournament_state_id=eq.${stateRow.id}`,
          },
          async () => {
            const { data: updated } = await supabase
              .from('live_tournament_players')
              .select('status')
              .eq('tournament_state_id', stateIdRef.current!)

            const all = updated ?? []
            setData((prev) => prev ? ({
              ...prev,
              activePlayers: all.filter((p) => p.status === 'active').length,
              totalPlayers: all.length,
            }) : null)
          }
        )
        .subscribe()
    }

    init()

    return () => {
      stateChannel?.unsubscribe()
      playersChannel?.unsubscribe()
    }
  }, [])

  return data
}
