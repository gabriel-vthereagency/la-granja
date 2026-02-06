import { getBlindLevel } from '@lagranja/core'
import type { GamePhase } from '@lagranja/types'

interface CenterPanelProps {
  currentLevel: number
  timeRemaining: number
  isPaused: boolean
  gamePhase: GamePhase
}

export function CenterPanel({
  currentLevel,
  timeRemaining,
  isPaused,
  gamePhase,
}: CenterPanelProps) {
  const level = getBlindLevel(currentLevel)
  const isBreak = level?.type === 'break'
  const levelDuration = level?.durationSec ?? 720

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Progress: how much time has elapsed (for progress bar)
  const progress = levelDuration > 0 ? ((levelDuration - timeRemaining) / levelDuration) * 100 : 0

  const getPhaseLabel = () => {
    switch (gamePhase) {
      case 'final_table':
        return 'MESA FINAL'
      case 'heads_up':
        return 'HEADS UP'
      case 'champion':
        return 'CAMPEÓN'
      default:
        return null
    }
  }

  const phaseLabel = getPhaseLabel()

  return (
    <div className="center-panel">
      {/* Badges */}
      <div className="center-badges">
        <span className="level-badge">
          NIVEL {isBreak ? 'BREAK' : currentLevel + 1}
        </span>
        {phaseLabel && <span className="phase-badge">{phaseLabel}</span>}
      </div>

      {/* Clock */}
      <div className="center-clock">
        <span className={`clock-time ${isPaused ? 'paused' : ''}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Blinds Info */}
      <div className="center-blinds">
        <span className="blinds-label">CIEGAS ACTUALES</span>
        <div className="blinds-display">
          {isBreak ? (
            <span className="blinds-break">DESCANSO</span>
          ) : level?.type === 'level' ? (
            <>
              <span className="blind-value">{level.sb}</span>
              <span className="blind-separator">/</span>
              <span className="blind-value">{level.bb}</span>
            </>
          ) : (
            <span className="blinds-break">-</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
    </div>
  )
}
