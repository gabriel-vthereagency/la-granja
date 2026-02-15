import { useState, useEffect, useRef, useCallback } from 'react'
import { useLiveTournament } from './hooks/useLiveTournament'
import { useSoundEffects } from './hooks/useSoundEffects'
import { calculateTournamentStats, calculatePrizePool } from '@lagranja/core'
import type { GamePhase } from '@lagranja/types'
import { Header } from './components/Header'
import { SidePanel } from './components/SidePanel'
import { CenterPanel } from './components/CenterPanel'
import { StatsRow } from './components/StatsRow'
import { PrizesRow } from './components/PrizesRow'
import { ChampionModal } from './components/ChampionModal'

const ROTATION_INTERVAL = 8000 // 8 seconds between stats/prizes
const ELIM_MODAL_DURATION = 6000 // 6 seconds
const STAGE_W = 1920
const STAGE_H = 1080

function useStageScale() {
  const [stageStyle, setStageStyle] = useState<React.CSSProperties>({})
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const override = params.get('scale')

    const calc = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const s = override ? parseFloat(override) : Math.min(vw / STAGE_W, vh / STAGE_H) * 0.98

      // Scaled dimensions
      const scaledW = STAGE_W * s
      const scaledH = STAGE_H * s

      // Center in viewport
      const left = (vw - scaledW) / 2
      const top = (vh - scaledH) / 2

      setStageStyle({
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        transform: `scale(${s})`,
        transformOrigin: 'top left',
      })
    }

    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  return { stageStyle, stageRef }
}

export default function App() {
  const { state, loading, error } = useLiveTournament()
  const [showStats, setShowStats] = useState(true)
  const { stageStyle, stageRef } = useStageScale()
  const { playElimination, playRebuy, playLevelUp } = useSoundEffects()
  const [elimModal, setElimModal] = useState<string | null>(null)
  const elimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track previous values to detect changes
  const prevEliminatedRef = useRef<number>(-1)
  const prevRebuysRef = useRef<number>(-1)
  const prevLevelRef = useRef<number>(-1)
  const prevEliminatedNamesRef = useRef<Set<string>>(new Set())

  const triggerFlash = useCallback((panelClass: string) => {
    const el = document.querySelector(`.side-panel.${panelClass}`)
    if (!el) return
    el.classList.remove('flash-effect')
    // Force reflow to restart animation
    void (el as HTMLElement).offsetWidth
    el.classList.add('flash-effect')
  }, [])

  const showElimModal = useCallback((name: string) => {
    if (elimTimerRef.current) clearTimeout(elimTimerRef.current)
    setElimModal(name)
    elimTimerRef.current = setTimeout(() => setElimModal(null), ELIM_MODAL_DURATION)
  }, [])

  // Detect eliminations, rebuys, and level changes
  const eliminatedPlayers = state.players.filter((p) => p.status === 'eliminated')
  const eliminatedCount = eliminatedPlayers.length
  const rebuyCount = state.totalRebuys

  useEffect(() => {
    const currentNames = new Set(eliminatedPlayers.map((p) => p.name))

    // Skip first render (initial load)
    if (prevEliminatedRef.current === -1) {
      prevEliminatedRef.current = eliminatedCount
      prevRebuysRef.current = rebuyCount
      prevLevelRef.current = state.currentLevel
      prevEliminatedNamesRef.current = currentNames
      return
    }

    if (eliminatedCount > prevEliminatedRef.current) {
      playElimination()
      triggerFlash('eliminados')
      // Find the newly eliminated player (name not in previous set)
      const newlyEliminated = eliminatedPlayers.find((p) => !prevEliminatedNamesRef.current.has(p.name))
      if (newlyEliminated) {
        showElimModal(newlyEliminated.name)
      }
    }
    prevEliminatedRef.current = eliminatedCount
    prevEliminatedNamesRef.current = currentNames

    if (rebuyCount > prevRebuysRef.current) {
      playRebuy()
      triggerFlash('recompras')
    }
    prevRebuysRef.current = rebuyCount

    if (state.currentLevel !== prevLevelRef.current) {
      playLevelUp()
    }
    prevLevelRef.current = state.currentLevel
  }, [eliminatedCount, rebuyCount, state.currentLevel, eliminatedPlayers, playElimination, playRebuy, playLevelUp, triggerFlash, showElimModal])

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
        style={stageStyle}
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

        {/* Elimination popup */}
        {elimModal && (
          <div className="elim-modal-backdrop">
            <div className="elim-modal">
              <img src={`${import.meta.env.BASE_URL}eliminado.jpg`} alt="Eliminado" className="elim-modal-img" />
              <div className="elim-modal-name">{elimModal}</div>
            </div>
          </div>
        )}

        {/* Champion Modal - inside stage so it scales with it */}
        {showChampion && championNameDisplay && (
          <ChampionModal
            championName={championNameDisplay}
            players={state.players}
          />
        )}
      </div>

    </div>
  )
}
