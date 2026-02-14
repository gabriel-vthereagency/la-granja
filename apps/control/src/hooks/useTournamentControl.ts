import { useEffect, useState, useCallback, useRef } from 'react'
import type { LiveTournamentState, LivePlayer, GamePhase } from '@lagranja/types'
import {
  BLIND_STRUCTURE,
  getPointsForPosition,
  calculatePrizePool,
  type SeasonType,
} from '@lagranja/core'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useSeasons } from './useSeasons'

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

export function useTournamentControl() {
  const { resolveEvent } = useSeasons()
  const [state, setState] = useState<LiveTournamentState>(DEFAULT_STATE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const stateIdRef = useRef<string | null>(null)
  const resolvingEventRef = useRef(false)

  // Control NO maneja countdown - solo Timer lo hace
  // Control solo muestra el estado y envía comandos
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Realtime subscription para ver actualizaciones del Timer
  useEffect(() => {
    if (!stateIdRef.current || loading) return

    // Helper para cargar jugadores
    const loadPlayers = async () => {
      if (!stateIdRef.current) return
      const { data: playersData } = await supabase
        .from('live_tournament_players')
        .select('*')
        .eq('tournament_state_id', stateIdRef.current)

      const players: LivePlayer[] = (playersData ?? []).map((p) => ({
        id: p.id,
        playerId: p.player_id ?? p.id,
        name: p.name,
        status: p.status as 'active' | 'eliminated',
        position: p.position,
        hasRebuy: p.has_rebuy,
      }))

      const totalRebuys = players.filter((p) => p.hasRebuy).length
      setState((prev) => ({ ...prev, players, totalRebuys }))
    }

    // Suscribirse a cambios en live_tournament_state (tiempo del Timer)
    const stateChannel = supabase
      .channel('control-state-changes')
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
          console.log('[Control] State update received:', stateData)

          setState((prev) => ({
            ...prev,
            currentLevel: stateData.current_level as number,
            timeRemaining: stateData.time_remaining as number,
            isPaused: stateData.is_paused as boolean,
            eventId: stateData.event_id !== undefined ? (stateData.event_id as string | null) : prev.eventId,
            gamePhase: stateData.game_phase ? (stateData.game_phase as GamePhase) : prev.gamePhase,
            championId: stateData.champion_id !== undefined ? (stateData.champion_id as string | null) : prev.championId,
            championName: stateData.champion_name !== undefined ? (stateData.champion_name as string | null) : prev.championName,
            buyInAmount: typeof stateData.buy_in_amount === 'number' ? stateData.buy_in_amount : prev.buyInAmount,
            tournamentName: stateData.tournament_name !== undefined ? (stateData.tournament_name as string | null) : prev.tournamentName,
            seasonName: stateData.season_name !== undefined ? (stateData.season_name as string | null) : prev.seasonName,
            eventNumber: stateData.event_number !== undefined ? (stateData.event_number as number | null) : prev.eventNumber,
            totalEvents: stateData.total_events !== undefined ? (stateData.total_events as number | null) : prev.totalEvents,
            updatedAt: new Date(stateData.updated_at as string),
          }))
        }
      )
      .subscribe((status) => {
        console.log('[Control] State subscription status:', status)
      })

    // Suscribirse a cambios en live_tournament_players
    const playersChannel = supabase
      .channel('control-players-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_tournament_players',
          filter: `tournament_state_id=eq.${stateIdRef.current}`,
        },
        () => {
          console.log('[Control] Players changed, reloading...')
          loadPlayers()
        }
      )
      .subscribe((status) => {
        console.log('[Control] Players subscription status:', status)
      })

    channelRef.current = stateChannel

    return () => {
      stateChannel.unsubscribe()
      playersChannel.unsubscribe()
    }
  }, [loading])

  // Cargar estado inicial
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        let { data: stateData, error: fetchError } = await supabase
          .from('live_tournament_state')
          .select('*')
          .limit(1)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No hay registro, crear uno nuevo
            const { data: newData, error: insertError } = await supabase
              .from('live_tournament_state')
              .insert({
                current_level: 0,
                time_remaining: BLIND_STRUCTURE[0]?.durationSec ?? 720,
                is_paused: true,
                buy_in_amount: 10000,
              })
              .select()
              .single()

            if (insertError) throw insertError
            stateData = newData
          } else {
            throw fetchError
          }
        }

        if (stateData) {
          stateIdRef.current = stateData.id

          // Cargar jugadores
          const { data: playersData } = await supabase
            .from('live_tournament_players')
            .select('*')
            .eq('tournament_state_id', stateData.id)

          const players: LivePlayer[] = (playersData ?? []).map((p) => ({
            id: p.id, // UUID de live_tournament_players
            playerId: p.player_id ?? p.id, // ID del jugador en tabla players
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
            gamePhase: (stateData.game_phase as GamePhase) ?? 'normal',
            championId: stateData.champion_id,
            championName: stateData.champion_name,
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
        setError(err instanceof Error ? err.message : 'Error loading tournament state')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialState()
  }, [])

  // Actualizar estado en Supabase
  const updateState = useCallback(async (updates: Partial<LiveTournamentState>) => {
    if (!stateIdRef.current) return

    const dbUpdates: Record<string, unknown> = {}

    if (updates.currentLevel !== undefined) dbUpdates.current_level = updates.currentLevel
    if (updates.timeRemaining !== undefined) dbUpdates.time_remaining = updates.timeRemaining
    if (updates.isPaused !== undefined) dbUpdates.is_paused = updates.isPaused
    if (updates.buyInAmount !== undefined) dbUpdates.buy_in_amount = updates.buyInAmount
    if (updates.gamePhase !== undefined) dbUpdates.game_phase = updates.gamePhase
    if (updates.championId !== undefined) dbUpdates.champion_id = updates.championId
    if (updates.championName !== undefined) dbUpdates.champion_name = updates.championName
    if (updates.tournamentName !== undefined) dbUpdates.tournament_name = updates.tournamentName
    if (updates.seasonName !== undefined) dbUpdates.season_name = updates.seasonName
    if (updates.eventNumber !== undefined) dbUpdates.event_number = updates.eventNumber
    if (updates.totalEvents !== undefined) dbUpdates.total_events = updates.totalEvents

    try {
      const { error: updateError } = await supabase
        .from('live_tournament_state')
        .update(dbUpdates)
        .eq('id', stateIdRef.current)

      if (updateError) throw updateError

      // Actualizar estado local
      setState((prev) => ({ ...prev, ...updates, updatedAt: new Date() }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating state')
    }
  }, [])

  // Controles del reloj
  const play = useCallback(() => updateState({ isPaused: false }), [updateState])
  const pause = useCallback(() => updateState({ isPaused: true }), [updateState])

  const nextLevel = useCallback(() => {
    const nextIndex = state.currentLevel + 1
    if (nextIndex < BLIND_STRUCTURE.length) {
      const nextLevelData = BLIND_STRUCTURE[nextIndex]
      updateState({
        currentLevel: nextIndex,
        timeRemaining: nextLevelData?.durationSec ?? 720,
        isPaused: false, // Auto-play al cambiar nivel
      })
    }
  }, [state.currentLevel, updateState])

  const prevLevel = useCallback(() => {
    const prevIndex = state.currentLevel - 1
    if (prevIndex >= 0) {
      const prevLevelData = BLIND_STRUCTURE[prevIndex]
      updateState({
        currentLevel: prevIndex,
        timeRemaining: prevLevelData?.durationSec ?? 720,
        isPaused: false, // Auto-play al cambiar nivel
      })
    }
  }, [state.currentLevel, updateState])

  // Gestión de jugadores (guardar en DB)
  const addPlayer = useCallback(async (player: LivePlayer) => {
    if (!stateIdRef.current) return

    try {
      const { data, error: insertError } = await supabase
        .from('live_tournament_players')
        .insert({
          tournament_state_id: stateIdRef.current,
          player_id: player.playerId, // Referencia a tabla players (puede ser null)
          name: player.name,
          status: 'active',
          has_rebuy: false,
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (data) {
        const newPlayer: LivePlayer = {
          id: data.id, // UUID de live_tournament_players (para DB ops)
          playerId: player.playerId, // ID del jugador en tabla players
          name: data.name,
          status: 'active',
          position: null,
          hasRebuy: false,
        }
        setState((prev) => ({
          ...prev,
          players: [...prev.players, newPlayer],
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding player')
    }
  }, [])

  const removePlayer = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('live_tournament_players')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== id),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing player')
    }
  }, [])

  // Determinar la fase del juego basada en jugadores activos
  const determineGamePhase = useCallback((activePlayers: number): GamePhase => {
    if (activePlayers <= 1) return 'champion'
    if (activePlayers === 2) return 'heads_up'
    if (activePlayers <= 9) return 'final_table'
    return 'normal'
  }, [])

  const eliminatePlayer = useCallback(async (id: string, position: number) => {
    try {
      const { error: updateError } = await supabase
        .from('live_tournament_players')
        .update({ status: 'eliminated', position })
        .eq('id', id)

      if (updateError) throw updateError

      // Actualizar estado local y calcular nueva fase
      setState((prev) => {
        const updatedPlayers = prev.players.map((p) =>
          p.id === id ? { ...p, status: 'eliminated' as const, position } : p
        )
        const activeCount = updatedPlayers.filter((p) => p.status === 'active').length
        const newPhase = determineGamePhase(activeCount)

        // Si hay un campeón, obtener su info
        let championId = prev.championId
        let championName = prev.championName
        if (newPhase === 'champion') {
          const champion = updatedPlayers.find((p) => p.status === 'active')
          if (champion) {
            championId = champion.playerId
            championName = champion.name
            // Marcar al campeón como posición 1
            const championIndex = updatedPlayers.findIndex((p) => p.id === champion.id)
            if (championIndex !== -1 && updatedPlayers[championIndex]) {
              updatedPlayers[championIndex] = { ...updatedPlayers[championIndex], position: 1 } as LivePlayer
            }
          }
        }

        // Actualizar fase en DB si cambió
        if (newPhase !== prev.gamePhase) {
          const dbUpdates: Record<string, unknown> = { game_phase: newPhase }
          if (newPhase === 'champion' && championId) {
            dbUpdates.champion_id = championId
            dbUpdates.champion_name = championName
            dbUpdates.is_paused = true // Pausar reloj cuando hay campeón

            // Guardar posición 1 del campeón en la DB
            const champion = updatedPlayers.find((p) => p.status === 'active')
            if (champion?.id) {
              supabase
                .from('live_tournament_players')
                .update({ position: 1 })
                .eq('id', champion.id)
            }
          }
          supabase
            .from('live_tournament_state')
            .update(dbUpdates)
            .eq('id', stateIdRef.current!)
        }

        return {
          ...prev,
          players: updatedPlayers,
          gamePhase: newPhase,
          championId,
          championName,
          isPaused: newPhase === 'champion' ? true : prev.isPaused,
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminating player')
    }
  }, [determineGamePhase])

  const addRebuy = useCallback(async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('live_tournament_players')
        .update({ has_rebuy: true })
        .eq('id', id)

      if (updateError) throw updateError

      setState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === id ? { ...p, hasRebuy: true } : p
        ),
        totalRebuys: prev.totalRebuys + 1,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding rebuy')
    }
  }, [])

  // Deshacer eliminación (volver a activo)
  const revertElimination = useCallback(async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('live_tournament_players')
        .update({ status: 'active', position: null })
        .eq('id', id)

      if (updateError) throw updateError

      setState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === id
            ? { ...p, status: 'active' as const, position: null }
            : p
        ),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reverting elimination')
    }
  }, [])

  // Deshacer rebuy
  const revertRebuy = useCallback(async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('live_tournament_players')
        .update({ has_rebuy: false })
        .eq('id', id)

      if (updateError) throw updateError

      setState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === id ? { ...p, hasRebuy: false } : p
        ),
        totalRebuys: Math.max(0, prev.totalRebuys - 1),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reverting rebuy')
    }
  }, [])

  // Guardar resultados en event_results
  const saveResults = useCallback(async () => {
    if (!stateIdRef.current) {
      setError('No hay torneo activo para guardar resultados')
      return false
    }

    try {
      let eventId = state.eventId

      if (!eventId && state.eventNumber) {
        const seasonType = deriveSeasonType(
          state.tournamentName ?? state.seasonName
        )

        if (seasonType) {
          const resolved = await resolveEvent(seasonType, state.eventNumber)
          if (resolved) {
            eventId = resolved.event.id
            await updateState({
              eventId,
              seasonName: resolved.season.name,
            })
          }
        }
      }

      if (!eventId) {
        setError('No hay evento asociado para guardar resultados')
        return false
      }

      // Obtener jugadores ordenados por posición
      const playersWithPositions = state.players
        .filter((p) => p.position !== null)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      // Calcular premios y puntos
      const prizeBreakdown = calculatePrizePool(
        state.players.length,
        state.totalRebuys,
        state.buyInAmount
      )

      // Crear registros de resultados
      const totalPlayers = state.players.length
      const results = playersWithPositions.map((player) => {
        const position = player.position ?? 0
        const prizeInfo = prizeBreakdown.prizes.find((p) => p.position === position)
        return {
          event_id: eventId,
          player_id: player.playerId,
          position,
          rebuys: player.hasRebuy ? 1 : 0,
          points: getPointsForPosition(position, totalPlayers),
          prize: prizeInfo?.amount ?? 0,
        }
      })

      // Insertar resultados (upsert para evitar duplicados)
      const { error: insertError } = await supabase
        .from('event_results')
        .upsert(results, { onConflict: 'event_id,player_id' })

      if (insertError) throw insertError

      // Marcar evento como finalizado
      await supabase
        .from('event_nights')
        .update({ status: 'finished' })
        .eq('id', eventId)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando resultados')
      return false
    }
  }, [
    resolveEvent,
    state.eventId,
    state.eventNumber,
    state.players,
    state.totalRebuys,
    state.buyInAmount,
    state.tournamentName,
    state.seasonName,
    updateState,
  ])

  // Si hay numero de fecha pero no eventId, intentar resolverlo automaticamente
  useEffect(() => {
    if (resolvingEventRef.current) return
    if (state.eventId || !state.eventNumber) return

    const seasonType = deriveSeasonType(
      state.tournamentName ?? state.seasonName
    )
    if (!seasonType) return

    resolvingEventRef.current = true
    resolveEvent(seasonType, state.eventNumber)
      .then((resolved) => {
        if (resolved) {
          updateState({
            eventId: resolved.event.id,
            seasonName: resolved.season.name,
          })
        }
      })
      .finally(() => {
        resolvingEventRef.current = false
      })
  }, [
    resolveEvent,
    state.eventId,
    state.eventNumber,
    state.tournamentName,
    state.seasonName,
    updateState,
  ])

  // Reset torneo
  const resetTournament = useCallback(async () => {
    if (!stateIdRef.current) return

    try {
      // Eliminar todos los jugadores
      await supabase
        .from('live_tournament_players')
        .delete()
        .eq('tournament_state_id', stateIdRef.current)

      // Resetear estado en DB (UN SOLO UPDATE con todos los campos)
      const firstLevel = BLIND_STRUCTURE[0]
      const firstLevelDuration = firstLevel?.durationSec ?? 720

      await supabase
        .from('live_tournament_state')
        .update({
          current_level: 0,
          time_remaining: firstLevelDuration,
          is_paused: true,
          game_phase: 'normal',
          champion_id: null,
          champion_name: null,
          event_id: null,
          tournament_name: null,
          season_name: null,
          event_number: null,
          total_events: null,
        })
        .eq('id', stateIdRef.current)

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        players: [],
        totalRebuys: 0,
        currentLevel: 0,
        timeRemaining: firstLevelDuration,
        isPaused: true,
        gamePhase: 'normal',
        championId: null,
        championName: null,
        eventId: null,
        tournamentName: null,
        seasonName: null,
        eventNumber: null,
        totalEvents: null,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error resetting tournament')
    }
  }, [])

  // Asociar evento al torneo
  const setEventId = useCallback(async (eventId: string) => {
    if (!stateIdRef.current) return

    try {
      const { error: updateError } = await supabase
        .from('live_tournament_state')
        .update({ event_id: eventId })
        .eq('id', stateIdRef.current)

      if (updateError) throw updateError

      setState((prev) => ({ ...prev, eventId }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error setting event')
    }
  }, [])

  // Actualizar info del torneo para display (nombre/fecha)
  const setTournamentInfo = useCallback(
    async (info: {
      eventId?: string | null
      tournamentName?: string | null
      seasonName?: string | null
      eventNumber?: number | null
      totalEvents?: number | null
    }) => {
      const hasUpdates = Object.values(info).some((value) => value !== undefined)
      if (!hasUpdates) return
      await updateState(info)
    },
    [updateState]
  )

  return {
    state,
    loading,
    error,
    // Controles del reloj
    play,
    pause,
    nextLevel,
    prevLevel,
    // Gestión de jugadores
    addPlayer,
    removePlayer,
    eliminatePlayer,
    addRebuy,
    // Deshacer
    revertElimination,
    revertRebuy,
    // Reset
    resetTournament,
    // Evento
    setEventId,
    setTournamentInfo,
    // Resultados
    saveResults,
  }
}

function deriveSeasonType(name?: string | null): SeasonType | null {
  if (!name) return null
  const lower = name.toLowerCase()
  if (lower.includes('apertura')) return 'apertura'
  if (lower.includes('clausura')) return 'clausura'
  if (lower.includes('summer')) return 'summer'
  return null
}



