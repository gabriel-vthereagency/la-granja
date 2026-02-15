import { useEffect, useState, useRef } from 'react'
import type { LiveTournamentState, LivePlayer } from '@lagranja/types'
import { BLIND_STRUCTURE } from '@lagranja/types'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

const DEFAULT_STATE: LiveTournamentState = {
  id: '',
  eventId: null,
  currentLevel: 0,
  timeRemaining: BLIND_STRUCTURE[0]?.durationSec ?? 720,
  isPaused: true,
  gamePhase: 'normal',
  championId: null,
  championName: null,
  players: [],
  totalRebuys: 0,
  buyInAmount: 10000,
  tournamentName: null,
  seasonName: null,
  eventNumber: null,
  totalEvents: null,
  updatedAt: new Date(),
}

export function useLiveTournament() {
  const [state, setState] = useState<LiveTournamentState>(DEFAULT_STATE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const stateIdRef = useRef<string | null>(null)
  const lastSyncRef = useRef<number>(0)
  const lastLevelRef = useRef<number>(0)
  const lastPausedRef = useRef<boolean>(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Cargar estado inicial
  useEffect(() => {
    const fetchState = async () => {
      try {
        const { data: stateData, error: stateError } = await supabase
          .from('live_tournament_state')
          .select('*')
          .limit(1)
          .single()

        if (stateError && stateError.code !== 'PGRST116') {
          throw stateError
        }

        if (stateData) {
          stateIdRef.current = stateData.id
          lastLevelRef.current = stateData.current_level
          lastPausedRef.current = stateData.is_paused

          const { data: playersData } = await supabase
            .from('live_tournament_players')
            .select('*')
            .eq('tournament_state_id', stateData.id)

          const players: LivePlayer[] = (playersData ?? []).map((p) => ({
            playerId: p.player_id ?? p.id,
            name: p.name,
            status: p.status as 'active' | 'eliminated',
            position: p.position,
            hasRebuy: p.has_rebuy,
          }))

          const totalRebuys = players.filter((p) => p.hasRebuy).length

          setState({
            id: stateData.id,
            eventId: stateData.event_id,
            currentLevel: stateData.current_level,
            timeRemaining: stateData.time_remaining,
            isPaused: stateData.is_paused,
            gamePhase: stateData.game_phase ?? 'normal',
            championId: stateData.champion_id ?? null,
            championName: stateData.champion_name ?? null,
            players,
            totalRebuys,
            buyInAmount: stateData.buy_in_amount ?? 10000,
            tournamentName: stateData.tournament_name ?? null,
            seasonName: stateData.season_name ?? null,
            eventNumber: stateData.event_number ?? null,
            totalEvents: stateData.total_events ?? null,
            updatedAt: new Date(stateData.updated_at),
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading tournament')
      } finally {
        setLoading(false)
      }
    }

    fetchState()
  }, [])

  // Realtime subscription para comandos de Control
  useEffect(() => {
    if (!stateIdRef.current) return

    // Helper para cargar jugadores
    const loadPlayers = async () => {
      if (!stateIdRef.current) return
      const { data: playersData } = await supabase
        .from('live_tournament_players')
        .select('*')
        .eq('tournament_state_id', stateIdRef.current)

      const players: LivePlayer[] = (playersData ?? []).map((p) => ({
        playerId: p.player_id ?? p.id,
        name: p.name,
        status: p.status as 'active' | 'eliminated',
        position: p.position,
        hasRebuy: p.has_rebuy,
      }))

      const totalRebuys = players.filter((p) => p.hasRebuy).length
      setState((prev) => ({ ...prev, players, totalRebuys }))
    }

    // Suscribirse a cambios en live_tournament_state
    const stateChannel = supabase
      .channel('timer-state-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_tournament_state',
          filter: `id=eq.${stateIdRef.current}`,
        },
        (payload) => {
          const stateData = payload.new as Record<string, unknown>
          console.log('[Timer] State update received:', stateData)
          const pauseToggled = stateData.is_paused !== lastPausedRef.current

          // Detectar RESET (currentLevel=0, championId=null, eventId=null)
          const isReset =
            stateData.current_level === 0 &&
            stateData.champion_id === null &&
            stateData.event_id === null &&
            stateData.game_phase === 'normal'

          if (isReset) {
            console.log('[Timer] Reset detected, clearing state')
            lastLevelRef.current = 0
            lastPausedRef.current = true
            setState({
              ...DEFAULT_STATE,
              id: stateData.id as string,
              currentLevel: 0,
              timeRemaining: stateData.time_remaining as number,
              isPaused: true,
              updatedAt: new Date(stateData.updated_at as string),
            })
            return
          }

          // Detectar cambio de nivel → auto-play con tiempo nuevo
          if (stateData.current_level !== lastLevelRef.current) {
            lastLevelRef.current = stateData.current_level as number
            const levelData = BLIND_STRUCTURE[stateData.current_level as number]
            setState((prev) => ({
              ...prev,
              currentLevel: stateData.current_level as number,
              timeRemaining: levelData?.durationSec ?? 720,
              isPaused: false, // Auto-play al cambiar nivel
              buyInAmount: (stateData.buy_in_amount as number) ?? 10000,
            }))
            return
          }

          // Detectar cambio de pausa
          if (pauseToggled) {
            lastPausedRef.current = stateData.is_paused as boolean

            if (stateData.is_paused) {
              // Al pausar: usar el tiempo LOCAL del Timer (más preciso que la DB)
              // y sincronizarlo a la DB para que Control lo vea
              setState((prev) => {
                // Guardar tiempo local en DB
                if (stateIdRef.current) {
                  void supabase
                    .from('live_tournament_state')
                    .update({ time_remaining: prev.timeRemaining })
                    .eq('id', stateIdRef.current)
                    .then(({ error: e }) => e && console.error('[Timer] Pause sync error:', e))
                }
                return { ...prev, isPaused: true }
              })
            } else {
              // Unpausing - usar tiempo de DB (que el Timer guardó al pausar)
              setState((prev) => ({
                ...prev,
                isPaused: false,
                timeRemaining: typeof stateData.time_remaining === 'number'
                  ? (stateData.time_remaining as number)
                  : prev.timeRemaining,
              }))
            }
            return // No actualizar otros campos si fue toggle de pausa
          }

          // Actualizar otros campos (buyInAmount, gamePhase, champion, tournament info)
          setState((prev) => ({
            ...prev,
            timeRemaining: typeof stateData.time_remaining === 'number' && stateData.is_paused === true
              ? (stateData.time_remaining as number)
              : prev.timeRemaining,
            buyInAmount: typeof stateData.buy_in_amount === 'number' ? stateData.buy_in_amount : prev.buyInAmount,
            gamePhase: stateData.game_phase ? (stateData.game_phase as 'normal' | 'final_table' | 'heads_up' | 'champion') : prev.gamePhase,
            championId: stateData.champion_id !== undefined ? (stateData.champion_id as string | null) : prev.championId,
            championName: stateData.champion_name !== undefined ? (stateData.champion_name as string | null) : prev.championName,
            tournamentName: stateData.tournament_name !== undefined ? (stateData.tournament_name as string | null) : prev.tournamentName,
            seasonName: stateData.season_name !== undefined ? (stateData.season_name as string | null) : prev.seasonName,
            eventNumber: stateData.event_number !== undefined ? (stateData.event_number as number | null) : prev.eventNumber,
            totalEvents: stateData.total_events !== undefined ? (stateData.total_events as number | null) : prev.totalEvents,
          }))
        }
      )
      .subscribe((status) => {
        console.log('[Timer] State subscription status:', status)
      })

    // Suscribirse a cambios en live_tournament_players
    const playersChannel = supabase
      .channel('timer-players-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'live_tournament_players',
          filter: `tournament_state_id=eq.${stateIdRef.current}`,
        },
        () => {
          console.log('[Timer] Players changed, reloading...')
          loadPlayers()
        }
      )
      .subscribe((status) => {
        console.log('[Timer] Players subscription status:', status)
      })

    channelRef.current = stateChannel

    return () => {
      stateChannel.unsubscribe()
      playersChannel.unsubscribe()
    }
  }, [loading]) // Re-suscribirse cuando termine de cargar (tenemos el stateId)

  // Countdown local (el Timer maneja el reloj)
  useEffect(() => {
    if (state.isPaused) return

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.isPaused) return prev

        const newTime = prev.timeRemaining - 1

        // Sincronizar con DB cada 10 segundos
        const now = Date.now()
        if (now - lastSyncRef.current > 10000 && stateIdRef.current) {
          lastSyncRef.current = now
          void supabase
            .from('live_tournament_state')
            .update({ time_remaining: newTime })
            .eq('id', stateIdRef.current)
            .then(({ error: e }) => e && console.error('[Timer] Sync error:', e))
        }

        // Si llega a 0, pausar y notificar
        if (newTime <= 0) {
          const nextLevelIndex = prev.currentLevel + 1
          if (nextLevelIndex < BLIND_STRUCTURE.length) {
            const nextLevel = BLIND_STRUCTURE[nextLevelIndex]
            if (stateIdRef.current) {
              void supabase
                .from('live_tournament_state')
                .update({
                  current_level: nextLevelIndex,
                  time_remaining: nextLevel?.durationSec ?? 720,
                  is_paused: false,
                })
                .eq('id', stateIdRef.current)
                .then(({ error: e }) => e && console.error('[Timer] Level advance error:', e))
            }
            lastLevelRef.current = nextLevelIndex
            lastPausedRef.current = false
            return {
              ...prev,
              currentLevel: nextLevelIndex,
              timeRemaining: nextLevel?.durationSec ?? 720,
              isPaused: false,
            }
          }

          if (stateIdRef.current) {
            void supabase
              .from('live_tournament_state')
              .update({ time_remaining: 0, is_paused: true })
              .eq('id', stateIdRef.current)
              .then(({ error: e }) => e && console.error('[Timer] End error:', e))
          }
          lastPausedRef.current = true
          return { ...prev, timeRemaining: 0, isPaused: true }
        }

        return { ...prev, timeRemaining: newTime }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.isPaused])

  return { state, loading, error }
}
