import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlayerStanding } from '../hooks/useStandings'
import { formatPoints } from '../utils/formatPoints'
import { staggerFast, tableRow, smooth } from '../lib/motion'

interface Props {
  standings: PlayerStanding[]
  seasonName?: string
  currentEvent?: number
  totalEvents?: number
}

type SortKey = 'position' | 'totalPoints' | 'eventsPlayed' | 'golds' | 'podiums' | 'finalTables'

export function StandingsTable({ standings, seasonName, currentEvent, totalEvents }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('position')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = [...standings].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (sortKey === 'position') {
      return sortAsc ? aVal - bVal : bVal - aVal
    }
    return sortAsc ? bVal - aVal : aVal - bVal
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'position')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {seasonName && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">{seasonName}</h2>
          {currentEvent && totalEvents && (
            <span className="text-text-secondary text-sm">
              Fecha {currentEvent} de {totalEvents}
            </span>
          )}
        </div>
      )}

      {/* Zone legend (mobile) */}
      <div className="md:hidden flex items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          Final 7
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold" />
          Fraca
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-surface-4" />
          Monos
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-glass border border-glass-border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2/80 backdrop-blur-sm text-text-tertiary">
              <SortHeader label="#" sortKey="position" current={sortKey} asc={sortAsc} onSort={handleSort} />
              <th className="px-3 py-3 text-left">Jugador</th>
              <SortHeader label="Pts" sortKey="totalPoints" current={sortKey} asc={sortAsc} onSort={handleSort} />
              <SortHeader label="J" sortKey="eventsPlayed" current={sortKey} asc={sortAsc} onSort={handleSort} title="Jugadas" />
              <SortHeader label="🥇" sortKey="golds" current={sortKey} asc={sortAsc} onSort={handleSort} title="Oros" />
              <th className="px-2 py-3 text-center" title="Platas">🥈</th>
              <th className="px-2 py-3 text-center" title="Bronces">🥉</th>
              <th className="px-2 py-3 text-center" title="Cuartos">4°</th>
              <th className="px-2 py-3 text-center" title="Quintos">5°</th>
              <SortHeader label="Pod" sortKey="podiums" current={sortKey} asc={sortAsc} onSort={handleSort} title="Podios (top 5)" />
              <th className="px-2 py-3 text-center" title="Últimos">Últ</th>
              <SortHeader label="MF" sortKey="finalTables" current={sortKey} asc={sortAsc} onSort={handleSort} title="Mesas Finales (top 9)" />
              <th className="px-2 py-3 text-center" title="Burbujas (6°)">Bur</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerFast} initial="initial" animate="animate">
            {sorted.map((s) => (
              <motion.tr
                key={s.playerId}
                variants={tableRow}
                className={`border-t border-glass-border hover:bg-glass-hover transition ${getZoneClass(s.position)}`}
              >
                <td className="px-3 py-2.5">
                  <span className={getPositionClass(s.position)}>{s.position}°</span>
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    to={`/jugadores/${s.playerId}`}
                    className="hover:text-accent-light transition"
                  >
                    {s.player.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-center font-medium text-success">
                  {formatPoints(s.totalPoints)}
                </td>
                <td className="px-2 py-2.5 text-center text-text-secondary">{s.eventsPlayed}</td>
                <td className="px-2 py-2.5 text-center text-gold">{s.golds || '-'}</td>
                <td className="px-2 py-2.5 text-center text-silver">{s.silvers || '-'}</td>
                <td className="px-2 py-2.5 text-center text-bronze">{s.bronzes || '-'}</td>
                <td className="px-2 py-2.5 text-center text-text-secondary">{s.fourths || '-'}</td>
                <td className="px-2 py-2.5 text-center text-text-secondary">{s.fifths || '-'}</td>
                <td className="px-2 py-2.5 text-center text-blue-400">{s.podiums || '-'}</td>
                <td className="px-2 py-2.5 text-center text-accent-light">{s.lastPlaces || '-'}</td>
                <td className="px-2 py-2.5 text-center text-purple-400">{s.finalTables || '-'}</td>
                <td className="px-2 py-2.5 text-center text-text-tertiary">{s.bubbles || '-'}</td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {sorted.map((s) => (
          <StandingCard key={s.playerId} standing={s} />
        ))}
      </div>
    </div>
  )
}

function SortHeader({
  label,
  sortKey,
  current,
  asc,
  onSort,
  title,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  asc: boolean
  onSort: (key: SortKey) => void
  title?: string
}) {
  const isActive = current === sortKey
  return (
    <th
      className={`px-2 py-3 text-center cursor-pointer transition select-none ${
        isActive ? 'text-text-primary' : 'hover:text-text-secondary'
      }`}
      onClick={() => onSort(sortKey)}
      title={title}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {isActive && (
          <motion.svg
            className="w-3 h-3 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: asc ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </motion.svg>
        )}
      </span>
    </th>
  )
}

function StandingCard({ standing: s }: { standing: PlayerStanding }) {
  const [expanded, setExpanded] = useState(false)
  const totalMedals = s.golds + s.silvers + s.bronzes

  return (
    <div className={`bg-glass border border-glass-border rounded-xl overflow-hidden ${getZoneBorder(s.position)}`}>
      <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Row 1: Position + Avatar + Name + Points */}
        <div className="flex items-center gap-2.5 px-4 pt-4">
          <span className={`font-bold text-lg w-8 shrink-0 ${getPositionClass(s.position)}`}>
            {s.position}°
          </span>
          <div className="w-9 h-9 bg-surface-3 rounded-full flex items-center justify-center text-lg shrink-0 overflow-hidden">
            <img
              src={`/Players/${s.player.id}.png`}
              alt=""
              className="w-full h-full object-cover object-top scale-150"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; e.currentTarget.parentElement!.textContent = '🐵' }}
            />
          </div>
          <span className="font-medium truncate">{s.player.name}</span>
          <div className="ml-auto shrink-0">
            <span className="text-2xl font-bold text-success leading-none">{formatPoints(s.totalPoints)}</span>
            <span className="text-xs text-text-tertiary ml-1">pts</span>
          </div>
        </div>

        {/* Separator + KPIs */}
        <div className="border-t border-glass-border mx-4 mt-3" />
        <div className="flex items-center gap-0 px-4 py-2 text-xs text-text-secondary">
          <span className="whitespace-nowrap">Jugadas: <span className="text-text-primary">{s.eventsPlayed}</span></span>
          <span className="text-text-tertiary/40 mx-2">|</span>
          <span className="whitespace-nowrap">Mesa Final: <span className="text-purple-400">{s.finalTables}</span></span>
          <span className="text-text-tertiary/40 mx-2">|</span>
          <span className="whitespace-nowrap">Medallas: <span className="text-text-primary">{totalMedals}</span></span>
          <span className="text-text-tertiary/40 mx-2">|</span>
          <span className="whitespace-nowrap">Último: <span className="text-text-secondary">{s.lastPlaces}</span></span>
        </div>

        {/* Chevron row */}
        <div className="flex justify-center pb-1.5">
          <motion.svg
            className="w-4 h-4 text-text-tertiary/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={smooth}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-glass-border pt-3">
              <div className="grid grid-cols-4 gap-3 text-center text-sm">
                <StatBox label="🥇" value={s.golds} color="text-gold" />
                <StatBox label="🥈" value={s.silvers} color="text-silver" />
                <StatBox label="🥉" value={s.bronzes} color="text-bronze" />
                <StatBox label="4°" value={s.fourths} color="text-text-secondary" />
                <StatBox label="5°" value={s.fifths} color="text-text-secondary" />
                <StatBox label="Burbuja" value={s.bubbles} color="text-text-tertiary" />
                <StatBox label="Presencias" value={s.eventsPlayed} color="text-text-secondary" />
              </div>
              <div className="mt-3 text-right">
                <Link
                  to={`/jugadores/${s.playerId}`}
                  className="text-accent-light text-sm hover:underline"
                >
                  Ver perfil →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div>
      <div className={`font-bold ${color}`}>{value || '-'}</div>
      <div className="text-xs text-text-tertiary">{label}</div>
    </div>
  )
}

function getPositionClass(position: number): string {
  if (position === 1) return 'text-gold'
  if (position === 2) return 'text-silver'
  if (position === 3) return 'text-bronze'
  return 'text-text-secondary'
}

function getZoneClass(position: number): string {
  if (position <= 8) return 'bg-accent/5 border-l-2 border-l-accent'
  if (position <= 16) return 'bg-gold/5 border-l-2 border-l-gold'
  return ''
}

function getZoneBorder(position: number): string {
  if (position <= 8) return 'border-l-2 !border-l-accent'
  if (position <= 16) return 'border-l-2 !border-l-gold'
  return ''
}
