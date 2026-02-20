import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { spring } from '../../lib/motion'
import type { PlayerCard } from '../../hooks/usePlayers'

const MONO_FALLBACKS: [string, string, string] = ['/Players/mono1.png', '/Players/mono2.png', '/Players/mono-3.png']

function getFallbackSrc(playerId: string): string {
  let hash = 0
  for (let i = 0; i < playerId.length; i += 1) {
    hash = (hash * 31 + playerId.charCodeAt(i)) >>> 0
  }
  return MONO_FALLBACKS[hash % MONO_FALLBACKS.length] ?? MONO_FALLBACKS[0]
}

function Thumbnail({
  player,
  onRemove,
}: {
  player: PlayerCard
  onRemove: () => void
}) {
  const [photoState, setPhotoState] = useState<'primary' | 'fallback' | 'emoji'>('primary')
  const photoSrc = `/Players/${player.id}.png`
  const fallbackSrc = getFallbackSrc(player.id)

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={spring}
      className="relative flex flex-col items-center gap-1"
    >
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/60 bg-surface-2">
        {photoState === 'primary' ? (
          <img
            src={photoSrc}
            alt={player.name}
            className="w-full h-full object-cover object-top"
            style={{ transform: 'scale(1.8)', transformOrigin: 'top center' }}
            onError={() => setPhotoState('fallback')}
          />
        ) : photoState === 'fallback' ? (
          <img
            src={fallbackSrc}
            alt=""
            className="w-full h-full object-cover object-top opacity-90"
            style={{ transform: 'scale(1.8)', transformOrigin: 'top center' }}
            onError={() => setPhotoState('emoji')}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-xl opacity-40">🐵</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-surface-1 border border-glass-border flex items-center justify-center text-text-tertiary hover:text-accent-light hover:border-accent/40 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <span className="text-[10px] text-text-tertiary max-w-[56px] truncate text-center">{player.name}</span>
    </motion.div>
  )
}

interface CompareBarProps {
  selectedPlayers: PlayerCard[]
  onDeselect: (id: string) => void
  onCompare: () => void
  onExit: () => void
}

export function CompareBar({ selectedPlayers, onDeselect, onCompare, onExit }: CompareBarProps) {
  const canCompare = selectedPlayers.length >= 2

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={spring}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none"
    >
      <div className="mx-auto max-w-2xl rounded-2xl bg-surface-2/90 backdrop-blur-xl border border-glass-border shadow-[0_-4px_30px_rgba(0,0,0,0.4)] p-4 pointer-events-auto">
        <div className="flex items-center gap-4">
          {/* Thumbnails */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AnimatePresence mode="popLayout">
              {selectedPlayers.map((p) => (
                <Thumbnail key={p.id} player={p} onRemove={() => onDeselect(p.id)} />
              ))}
            </AnimatePresence>
            {selectedPlayers.length === 0 && (
              <span className="text-text-tertiary text-sm">Selecciona 2 jugadores</span>
            )}
          </div>

          {/* Counter */}
          <span className="text-text-tertiary text-xs whitespace-nowrap">
            {selectedPlayers.length}/2
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCompare}
              disabled={!canCompare}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                canCompare
                  ? 'bg-accent text-white hover:bg-accent-light shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                  : 'bg-surface-3 text-text-tertiary cursor-not-allowed'
              }`}
            >
              Comparar
            </button>
            <button
              onClick={onExit}
              className="px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
