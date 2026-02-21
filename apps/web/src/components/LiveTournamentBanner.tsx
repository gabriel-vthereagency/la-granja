import { motion } from 'framer-motion'
import { useLiveTournament } from '../hooks/useLiveTournament'
import { spring } from '../lib/motion'
import { BLIND_STRUCTURE } from '@lagranja/types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function LiveTournamentBanner() {
  const data = useLiveTournament()

  if (!data) return null

  const level = BLIND_STRUCTURE[data.currentLevel]
  const isBreak = level?.type === 'break'
  const blindsText = level
    ? isBreak
      ? 'Descanso'
      : `${level.sb}/${level.bb}`
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="relative overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/10 via-surface-2/90 to-accent/10 backdrop-blur-sm"
    >
      {/* Animated glow border */}
      <div className="absolute inset-0 rounded-2xl animate-pulse opacity-30 bg-[radial-gradient(ellipse_at_50%_50%,rgba(239,68,68,0.3)_0%,transparent_70%)]" />

      <div className="relative px-5 py-4 flex items-center gap-4 flex-wrap">
        {/* Live dot */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <span className="text-sm font-bold text-accent-light uppercase tracking-wider">En vivo</span>
        </div>

        {/* Event info */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-text-primary font-semibold">Fecha #{data.eventNumber}</span>
          {data.seasonName && (
            <span className="text-text-tertiary">— {data.seasonName}</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Stats pills */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Players */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-glass border border-glass-border">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-text-tertiary">
              <path d="M7 7a3 3 0 100-6 3 3 0 000 6zM2 13a5 5 0 0110 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium text-text-primary">{data.activePlayers}</span>
            <span className="text-xs text-text-tertiary">/ {data.totalPlayers}</span>
          </div>

          {/* Blinds */}
          <div className="px-3 py-1 rounded-lg bg-glass border border-glass-border">
            <span className="text-xs text-text-tertiary mr-1">Ciegos</span>
            <span className={`text-sm font-semibold ${isBreak ? 'text-blue-400' : 'text-text-primary'}`}>
              {blindsText}
            </span>
          </div>

          {/* Level */}
          <div className="px-3 py-1 rounded-lg bg-glass border border-glass-border">
            <span className="text-xs text-text-tertiary mr-1">Nivel</span>
            <span className="text-sm font-semibold text-text-primary">{data.currentLevel + 1}</span>
          </div>

          {/* Time */}
          <div className="px-3 py-1 rounded-lg bg-accent-muted border border-accent/30">
            <span className="text-sm font-bold text-accent-light font-mono">
              {formatTime(data.timeRemaining)}
            </span>
          </div>

          {/* Game phase badge */}
          {data.gamePhase !== 'normal' && (
            <div className="px-3 py-1 rounded-lg bg-gold/15 border border-gold/30">
              <span className="text-sm font-semibold text-gold">
                {data.gamePhase === 'final_table' ? 'Mesa Final' :
                 data.gamePhase === 'heads_up' ? 'Heads Up' :
                 data.gamePhase}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
