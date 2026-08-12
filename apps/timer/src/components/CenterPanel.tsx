import { getBlindLevel } from '@lagranja/core'
import type { GamePhase } from '@lagranja/types'

interface CenterPanelProps {
  currentLevel: number
  timeRemaining: number
  isPaused: boolean
  gamePhase: GamePhase
  spotlightPlayerNames?: string[]
}

function playerNameToFilename(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents (ó→o, ñ→n, etc.)
    .replace(/[^a-z0-9]/g, '')       // remove non-alphanumeric
}

export function CenterPanel({
  currentLevel,
  timeRemaining,
  isPaused,
  gamePhase,
  spotlightPlayerNames = [],
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

  const photoUrl = (name: string) =>
    `${import.meta.env.BASE_URL}Players/${playerNameToFilename(name)}.png`

  const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    ;(e.target as HTMLImageElement).style.display = 'none'
  }

  return (
    <div className="center-panel">
      {/* Fotos de jugadores — ancladas al fondo del panel, detrás de todo */}
      {spotlightPlayerNames.length === 2 && (
        <img
          src={photoUrl(spotlightPlayerNames[0]!)}
          alt={spotlightPlayerNames[0]}
          className="center-player-photo left"
          onError={hideOnError}
        />
      )}
      {spotlightPlayerNames.length >= 1 && (
        <img
          src={photoUrl(spotlightPlayerNames[spotlightPlayerNames.length - 1]!)}
          alt={spotlightPlayerNames[spotlightPlayerNames.length - 1]}
          className="center-player-photo right"
          onError={hideOnError}
        />
      )}

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
