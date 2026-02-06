import { useState, useEffect, useCallback } from 'react'
import { useTournamentControl } from './hooks/useTournamentControl'
import { calculateTournamentStats, formatCurrency } from '@lagranja/core'
import { LevelControls } from './components/LevelControls'
import { PlayerList } from './components/PlayerList'
import { ConfirmButton } from './components/ConfirmButton'
import { PlayerRegistration } from './components/PlayerRegistration'
import { ChampionModal } from './components/ChampionModal'
import type { LivePlayer, Player } from '@lagranja/types'

type UndoAction =
  | { type: 'eliminate'; playerId: string; playerName: string }
  | { type: 'rebuy'; playerId: string; playerName: string }
  | { type: 'remove'; player: LivePlayer }

export default function App() {
  const {
    state,
    loading,
    error,
    play,
    pause,
    nextLevel,
    prevLevel,
    addPlayer,
    removePlayer,
    eliminatePlayer,
    addRebuy,
    resetTournament,
    revertElimination,
    revertRebuy,
    setTournamentInfo,
    saveResults,
  } = useTournamentControl()

  const [showRegistration, setShowRegistration] = useState(false)
  const [showChampionModal, setShowChampionModal] = useState(false)

  // Mostrar modal automáticamente cuando hay campeón
  useEffect(() => {
    if (state.gamePhase === 'champion' && state.championName) {
      setShowChampionModal(true)
    }
  }, [state.gamePhase, state.championName])
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null)
  const [undoTimeout, setUndoTimeout] = useState<number | null>(null)

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (undoTimeout) clearTimeout(undoTimeout)
    }
  }, [undoTimeout])

  const pushUndo = useCallback((action: UndoAction) => {
    if (undoTimeout) clearTimeout(undoTimeout)
    setUndoAction(action)
    const timeout = window.setTimeout(() => {
      setUndoAction(null)
    }, 8000) // 8 segundos para deshacer
    setUndoTimeout(timeout)
  }, [undoTimeout])

  const handleUndo = useCallback(() => {
    if (!undoAction) return

    switch (undoAction.type) {
      case 'eliminate':
        revertElimination(undoAction.playerId)
        break
      case 'rebuy':
        revertRebuy(undoAction.playerId)
        break
      case 'remove':
        addPlayer(undoAction.player)
        break
    }

    setUndoAction(null)
    if (undoTimeout) clearTimeout(undoTimeout)
  }, [undoAction, undoTimeout, revertElimination, revertRebuy, addPlayer])

  // Registrar multiples jugadores desde WhatsApp
  const handleRegisterPlayers = useCallback(
    (
      players: Array<{ player: Player; displayName: string }>,
      tournamentInfo: {
        eventId?: string | null
        tournamentName?: string | null
        seasonName?: string | null
        eventNumber?: number | null
        totalEvents?: number | null
      }
    ) => {
      // Asociar evento e info del torneo si se detecto
      void setTournamentInfo(tournamentInfo)

      for (const { player } of players) {
        const livePlayer: LivePlayer = {
          playerId: player.id,
          name: player.name, // Usar nombre oficial, no el alias de WhatsApp
          status: 'active',
          position: null,
          hasRebuy: false,
        }
        addPlayer(livePlayer)
      }
      setShowRegistration(false)
    },
    [addPlayer, setTournamentInfo]
  )

  const handleEliminate = useCallback((id: string) => {
    const player = state.players.find((p) => p.id === id)
    if (!player) return

    const activePlayers = state.players.filter((p) => p.status === 'active')
    const position = activePlayers.length
    eliminatePlayer(id, position)
    pushUndo({ type: 'eliminate', playerId: id, playerName: player.name })
  }, [state.players, eliminatePlayer, pushUndo])

  const handleRebuy = useCallback((id: string) => {
    const player = state.players.find((p) => p.id === id)
    if (!player) return

    addRebuy(id)
    pushUndo({ type: 'rebuy', playerId: id, playerName: player.name })
  }, [state.players, addRebuy, pushUndo])

  const handleRemove = useCallback((id: string) => {
    const player = state.players.find((p) => p.id === id)
    if (!player) return

    removePlayer(id)
    pushUndo({ type: 'remove', player })
  }, [state.players, removePlayer, pushUndo])

  const getUndoLabel = useCallback(() => {
    if (!undoAction) return ''
    switch (undoAction.type) {
      case 'eliminate':
        return `Deshacer OUT: ${undoAction.playerName}`
      case 'rebuy':
        return `Deshacer Rebuy: ${undoAction.playerName}`
      case 'remove':
        return `Restaurar: ${undoAction.player.name}`
    }
  }, [undoAction])

  // TODOS los hooks deben estar ANTES de cualquier return condicional
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-gray-500">Cargando...</div>
      </div>
    )
  }

  // Mostrar error como toast, no bloquear la UI
  const showError = error && (
    <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
      {error}
    </div>
  )

  const stats = calculateTournamentStats(state)

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {showError}

      {/* Modal de registro de jugadores */}
      {showRegistration && (
        <PlayerRegistration
          registeredPlayers={state.players}
          onRegister={handleRegisterPlayers}
          onClose={() => setShowRegistration(false)}
        />
      )}

      {/* Modal de campeón */}
      {showChampionModal && state.championName && (
        <ChampionModal
          championName={state.championName}
          players={state.players}
          totalRebuys={state.totalRebuys}
          buyInAmount={state.buyInAmount}
          eventId={state.eventId}
          onConfirm={saveResults}
          onClose={() => setShowChampionModal(false)}
        />
      )}

      {/* Boton Deshacer flotante */}
      {undoAction && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleUndo}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium shadow-lg animate-pulse"
          >
            ↩ {getUndoLabel()}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">
            La Granja Poker - Control
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {state.gamePhase === 'champion' && (
            <button
              onClick={() => setShowChampionModal(true)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded text-sm font-bold"
            >
              Ver Resultados
            </button>
          )}
          <ConfirmButton
            onConfirm={resetTournament}
            label="Reset Torneo"
            confirmLabel="¿Confirmar Reset?"
            className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded text-sm text-red-200"
            confirmClassName="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm text-white font-bold animate-pulse"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Nivel y Stats */}
        <div className="space-y-6">
          <LevelControls
            currentLevel={state.currentLevel}
            isPaused={state.isPaused}
            onPlay={play}
            onPause={pause}
            onNextLevel={nextLevel}
            onPrevLevel={prevLevel}
          />

          {/* Stats rapidos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm">Jugadores</div>
              <div className="text-2xl font-bold text-white">
                {stats.playersActive}/{stats.playersRegistered}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm">Pozo</div>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.prizePool)}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm">Recompras</div>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.totalRebuys}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm">Average</div>
              <div className="text-2xl font-bold text-white">
                {stats.averageStack.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Jugadores */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white">Jugadores</h2>
            <button
              onClick={() => setShowRegistration(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium text-sm"
            >
              + Pegar Lista
            </button>
          </div>

          <PlayerList
            players={state.players}
            onEliminate={handleEliminate}
            onRebuy={handleRebuy}
            onRemove={handleRemove}
          />
        </div>
      </div>
    </div>
  )
}
