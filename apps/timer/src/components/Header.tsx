import { useState, useEffect } from 'react'

interface HeaderProps {
  tournamentName: string
  year?: number
  eventNumber: number | null
  totalEvents: number | null
  isPaused: boolean
  gamePhase: 'normal' | 'final_table' | 'heads_up' | 'champion'
}

export function Header({
  tournamentName,
  year,
  eventNumber,
  totalEvents,
  isPaused,
  gamePhase,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Mark start time after first play
  useEffect(() => {
    if (!isPaused && !hasStarted) {
      setHasStarted(true)
    }
  }, [isPaused, hasStarted])

  // Track elapsed tournament time after start (pauses don't stop it)
  useEffect(() => {
    if (!hasStarted) return
    if (gamePhase === 'champion') return

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [hasStarted, gamePhase])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getElapsedTime = () => {
    if (!hasStarted) return '0:00:00'
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const secs = elapsedSeconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTournamentTitle = () => {
    const name = tournamentName || 'LA GRANJA POKER'
    const yearStr = year ? ` ${year}` : ''
    const fechaStr = eventNumber !== null
      ? ` · FECHA ${eventNumber}${totalEvents !== null ? `/${totalEvents}` : ''}`
      : ''
    return `${name}${yearStr}${fechaStr}`
  }

  return (
    <header className="timer-header">
      <div className="header-section header-left">
        <span className="header-label">HORA</span>
        <span className="header-value">{formatTime(currentTime)}</span>
      </div>

      <div className="header-section header-center">
        <span className="tournament-title">{getTournamentTitle()}</span>
      </div>

      <div className="header-section header-right">
        <span className="header-label">TIEMPO DE TORNEO</span>
        <span className="header-value">{getElapsedTime()}</span>
      </div>
    </header>
  )
}
