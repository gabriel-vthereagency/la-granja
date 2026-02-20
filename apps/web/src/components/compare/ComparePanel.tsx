import { useState } from 'react'
import { motion } from 'framer-motion'
import { spring, staggerFast, staggerItem } from '../../lib/motion'
import { useCompareProfiles, type CompareSlot } from '../../hooks/useCompareProfiles'
import { formatPoints } from '../../utils/formatPoints'
import type { PlayerProfile } from '../../hooks/usePlayerProfile'

const MONO_FALLBACKS: [string, string, string] = ['/Players/mono1.png', '/Players/mono2.png', '/Players/mono-3.png']

function getFallbackSrc(playerId: string): string {
  let hash = 0
  for (let i = 0; i < playerId.length; i += 1) {
    hash = (hash * 31 + playerId.charCodeAt(i)) >>> 0
  }
  return MONO_FALLBACKS[hash % MONO_FALLBACKS.length] ?? MONO_FALLBACKS[0]
}

function getBadgeSrc(titles: number): string {
  if (titles >= 3) return '/trifoh.png'
  if (titles === 2) return '/bihof.png'
  if (titles === 1) return '/hof.png'
  return '/mono.png'
}

interface StatDef {
  key: string
  label: string
  higherIsBetter: boolean
  format?: (v: number) => string
  color?: string
  section?: string
}

const COMPARE_STATS: StatDef[] = [
  // Core
  { key: 'totalEvents', label: 'Fechas jugadas', higherIsBetter: true, section: 'Rendimiento' },
  { key: 'totalPoints', label: 'Puntos totales', higherIsBetter: true, format: (v) => formatPoints(Math.round(v)) },
  { key: 'effectiveness', label: 'Efectividad', higherIsBetter: true, format: (v) => v.toFixed(2) },
  // Medals
  { key: 'golds', label: 'Oros', higherIsBetter: true, color: 'text-gold', section: 'Medallas' },
  { key: 'silvers', label: 'Platas', higherIsBetter: true, color: 'text-silver' },
  { key: 'bronzes', label: 'Bronces', higherIsBetter: true, color: 'text-bronze' },
  { key: 'podiums', label: 'Podios (top 5)', higherIsBetter: true },
  // Positions
  { key: 'fourths', label: '4to puesto', higherIsBetter: true, section: 'Posiciones' },
  { key: 'fifths', label: '5to puesto', higherIsBetter: true },
  { key: 'bubbles', label: 'Burbujas (6to)', higherIsBetter: false },
  // Other
  { key: 'finalTables', label: 'Mesas finales', higherIsBetter: true, section: 'Otros' },
  { key: 'lastPlaces', label: 'Últimos puestos', higherIsBetter: false },
]

function getStatValue(profile: PlayerProfile, key: string): number {
  if (key === 'podiums') {
    const s = profile.stats
    return s.golds + s.silvers + s.bronzes + s.fourths + s.fifths
  }
  return (profile.stats as Record<string, number>)[key] ?? 0
}

function findWinnerIndices(values: number[], higherIsBetter: boolean): number[] {
  const best = higherIsBetter ? Math.max(...values) : Math.min(...values)
  const winners = values.reduce<number[]>((acc, v, i) => {
    if (v === best) acc.push(i)
    return acc
  }, [])
  // If all tied, no winner
  return winners.length === values.length ? [] : winners
}

function PlayerColumnHeader({ slot, index }: { slot: CompareSlot; index: number }) {
  const [photoState, setPhotoState] = useState<'primary' | 'fallback' | 'emoji'>('primary')

  if (slot.loading) {
    return (
      <div className="flex flex-col items-center gap-2 min-w-[100px]">
        <div className="w-16 h-16 rounded-full bg-surface-3/60 animate-pulse" />
        <div className="w-20 h-4 rounded bg-surface-3/60 animate-pulse" />
      </div>
    )
  }

  if (!slot.profile) return null

  const { player, stats } = slot.profile
  const photoSrc = `/Players/${player.id}.png`
  const fallbackSrc = getFallbackSrc(player.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, ...spring }}
      className="flex flex-col items-center gap-2 min-w-[100px]"
    >
      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent/40 bg-surface-2">
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
          <span className="flex items-center justify-center w-full h-full text-2xl opacity-40">🐵</span>
        )}
        <img
          src={getBadgeSrc(stats.finalSevens)}
          alt=""
          className="absolute -bottom-0.5 -right-0.5 w-6 h-6 object-contain drop-shadow"
        />
      </div>
      <span className="text-sm font-bold text-text-primary text-center truncate max-w-[120px]">
        {player.name}
      </span>
      {player.nickname && (
        <span className="text-xs text-text-tertiary -mt-1">"{player.nickname}"</span>
      )}
    </motion.div>
  )
}

interface ComparePanelProps {
  selectedIds: string[]
  onClose: () => void
}

export function ComparePanel({ selectedIds, onClose }: ComparePanelProps) {
  const slots = useCompareProfiles(selectedIds)
  const loadedProfiles = slots.filter((s) => s.profile !== null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-surface-1/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Comparar jugadores</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Stats table with aligned headers */}
        <div className="rounded-xl border border-glass-border overflow-hidden">
          <div className="overflow-x-auto">
            <motion.table
              className="w-full table-fixed"
              variants={staggerFast}
              initial="initial"
              animate="animate"
            >
              <colgroup>
                <col className="w-[140px] sm:w-[180px]" />
                {selectedIds.map((id) => (
                  <col key={id} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="px-4 py-6" />
                  {slots.map((slot, i) => (
                    <th key={selectedIds[i]} className="px-4 py-6 align-bottom">
                      <PlayerColumnHeader slot={slot} index={i} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_STATS.map((stat, rowIndex) => {
                  const values = loadedProfiles.map((s) => getStatValue(s.profile!, stat.key))
                  const winners = findWinnerIndices(values, stat.higherIsBetter)
                  const showSection = stat.section

                  return (
                    <>
                      {showSection && (
                        <tr key={`section-${stat.section}`}>
                          <td
                            colSpan={selectedIds.length + 1}
                            className="px-4 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider bg-surface-2/50"
                          >
                            {stat.section}
                          </td>
                        </tr>
                      )}
                      <motion.tr
                        key={stat.key}
                        variants={staggerItem}
                        className={rowIndex % 2 === 0 ? 'bg-glass/30' : 'bg-transparent'}
                      >
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap font-medium sticky left-0 bg-inherit min-w-[140px]">
                          {stat.label}
                        </td>
                        {slots.map((slot, colIdx) => {
                          if (slot.loading) {
                            return (
                              <td key={colIdx} className="px-4 py-3 text-center">
                                <div className="w-8 h-4 rounded bg-surface-3/60 animate-pulse mx-auto" />
                              </td>
                            )
                          }
                          if (!slot.profile) return <td key={colIdx} />

                          const loadedIdx = loadedProfiles.findIndex((s) => s.profile === slot.profile)
                          const value = getStatValue(slot.profile, stat.key)
                          const isWinner = winners.includes(loadedIdx)
                          const formatted = stat.format ? stat.format(value) : String(value)

                          return (
                            <td key={colIdx} className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                                  isWinner
                                    ? stat.higherIsBetter
                                      ? 'bg-success/10 border border-success/30 text-success'
                                      : 'bg-accent-muted border border-accent/30 text-accent-light'
                                    : `${stat.color ?? 'text-text-primary'}`
                                }`}
                              >
                                {formatted}
                              </span>
                            </td>
                          )
                        })}
                      </motion.tr>
                    </>
                  )
                })}
              </tbody>
            </motion.table>
          </div>
        </div>

        {/* Bottom padding for mobile */}
        <div className="h-8" />
      </div>
    </motion.div>
  )
}
