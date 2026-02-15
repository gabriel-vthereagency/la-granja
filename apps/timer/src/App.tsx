import { useState, useEffect, useRef } from 'react'
import { useLiveTournament } from './hooks/useLiveTournament'
import { calculateTournamentStats, calculatePrizePool } from '@lagranja/core'
import type { GamePhase } from '@lagranja/types'
import { Header } from './components/Header'
import { SidePanel } from './components/SidePanel'
import { CenterPanel } from './components/CenterPanel'
import { StatsRow } from './components/StatsRow'
import { PrizesRow } from './components/PrizesRow'
import { ChampionModal } from './components/ChampionModal'

const ROTATION_INTERVAL = 8000 // 8 seconds between stats/prizes
const STAGE_W = 1920
const STAGE_H = 1080

function useStageScale() {
  const [scale, setScale] = useState(1)
  const [debugInfo, setDebugInfo] = useState('')
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Allow override via URL: ?scale=0.6
    const params = new URLSearchParams(window.location.search)
    const override = params.get('scale')

    const calc = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const sx = vw / STAGE_W
      const sy = vh / STAGE_H
      const s = override ? parseFloat(override) : Math.min(sx, sy) * 0.92
      setScale(s)
      setDebugInfo(`${vw}x${vh} | sx=${sx.toFixed(2)} sy=${sy.toFixed(2)} | scale=${s.toFixed(3)}`)
    }

    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  return { scale, stageRef, debugInfo }
}

export default function App() {
  const { state, loading, error } = useLiveTournament()
  const [showStats, setShowStats] = useState(true)
  const { scale, stageRef, debugInfo } = useStageScale()

  // Rotate between stats and prizes every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowStats((prev) => !prev)
    }, ROTATION_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="timer-app">
        <div className="loading-message">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="timer-app">
        <div className="error-message">Error: {error}</div>
      </div>
    )
  }

  const stats = calculateTournamentStats(state)
  const prizeBreakdown = calculatePrizePool(
    stats.playersRegistered,
    stats.totalRebuys,
    state.buyInAmount
  )

  const activePlayers = state.players.filter((player) => player.status === 'active').length
  const activeChampion = state.players.find((player) => player.status === 'active')
  const championNameDisplay = state.championName ?? activeChampion?.name ?? null
  const showChampion = activePlayers <= 1 && Boolean(championNameDisplay)

  const getDisplayPhase = (activeCount: number): GamePhase => {
    if (activeCount <= 1) return 'champion'
    if (activeCount === 2) return 'heads_up'
    if (activeCount <= 9) return 'final_table'
    return 'normal'
  }

  const displayPhase = getDisplayPhase(activePlayers)

  // Tournament info from state (with fallbacks)
  const tournamentName = state.tournamentName ?? state.seasonName ?? 'LA GRANJA POKER'
  const tournamentYear = new Date().getFullYear()
  const eventNumber = state.eventNumber
  const totalEvents = state.totalEvents

  return (
    <div className="timer-app">
      <div
        className="timer-stage"
        ref={stageRef}
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {/* Header */}
        <Header
          tournamentName={tournamentName}
          year={tournamentYear}
          eventNumber={eventNumber}
          totalEvents={totalEvents}
          isPaused={state.isPaused}
          gamePhase={state.gamePhase}
        />

        {/* Main 3-column layout */}
        <div className="main-layout">
          {/* Left: Eliminados */}
          <SidePanel type="eliminados" players={state.players} />

          {/* Center: Level + Clock */}
          <CenterPanel
            currentLevel={state.currentLevel}
            timeRemaining={state.timeRemaining}
            isPaused={state.isPaused}
            gamePhase={displayPhase}
          />

          {/* Right: Recompras */}
          <SidePanel type="recompras" players={state.players} />
        </div>

        {/* Stats/Prizes Row - Rotating */}
        <div className="bottom-container">
          <div className={`bottom-content ${showStats ? 'visible' : 'hidden'}`}>
            <StatsRow stats={stats} />
          </div>
          <div className={`bottom-content ${!showStats ? 'visible' : 'hidden'}`}>
            <PrizesRow prizeBreakdown={prizeBreakdown} />
          </div>
        </div>
      </div>

      {/* Debug overlay - remove after tuning */}
      <div className="debug-overlay">{debugInfo}</div>

      {/* Champion Modal */}
      {showChampion && championNameDisplay && (
        <ChampionModal
          championName={championNameDisplay}
          players={state.players}
        />
      )}
    </div>
  )
}
