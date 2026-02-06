import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PlayerStanding } from '../hooks/useStandings'
import { formatPoints } from '../utils/formatPoints'

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
          <h2 className="text-xl font-bold">{seasonName}</h2>
          {currentEvent && totalEvents && (
            <span className="text-gray-400">
              Fecha {currentEvent} de {totalEvents}
            </span>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 text-gray-400">
              <SortHeader label="#" sortKey="position" current={sortKey} onSort={handleSort} />
              <th className="px-3 py-3 text-left">Jugador</th>
              <SortHeader label="Pts" sortKey="totalPoints" current={sortKey} onSort={handleSort} />
              <SortHeader label="J" sortKey="eventsPlayed" current={sortKey} onSort={handleSort} title="Jugadas" />
              <SortHeader label="🥇" sortKey="golds" current={sortKey} onSort={handleSort} title="Oros" />
              <th className="px-2 py-3 text-center" title="Platas">🥈</th>
              <th className="px-2 py-3 text-center" title="Bronces">🥉</th>
              <th className="px-2 py-3 text-center" title="Cuartos">4°</th>
              <th className="px-2 py-3 text-center" title="Quintos">5°</th>
              <SortHeader label="Pod" sortKey="podiums" current={sortKey} onSort={handleSort} title="Podios (top 5)" />
              <th className="px-2 py-3 text-center" title="Últimos">Últ</th>
              <SortHeader label="MF" sortKey="finalTables" current={sortKey} onSort={handleSort} title="Mesas Finales (top 9)" />
              <th className="px-2 py-3 text-center" title="Burbujas (6°)">Bur</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr
                key={s.playerId}
                className={`border-t border-gray-700 hover:bg-gray-800/50 transition ${getZoneClass(s.position)}`}
              >
                <td className="px-3 py-2">
                  <span className={getPositionClass(s.position)}>{s.position}°</span>
                </td>
                <td className="px-3 py-2">
                  <Link
                    to={`/jugadores/${s.playerId}`}
                    className="hover:text-green-400 transition"
                  >
                    {s.player.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-center font-medium text-green-400">
                  {formatPoints(s.totalPoints)}
                </td>
                <td className="px-2 py-2 text-center text-gray-400">{s.eventsPlayed}</td>
                <td className="px-2 py-2 text-center text-yellow-500">{s.golds || '-'}</td>
                <td className="px-2 py-2 text-center text-gray-300">{s.silvers || '-'}</td>
                <td className="px-2 py-2 text-center text-orange-400">{s.bronzes || '-'}</td>
                <td className="px-2 py-2 text-center text-gray-400">{s.fourths || '-'}</td>
                <td className="px-2 py-2 text-center text-gray-400">{s.fifths || '-'}</td>
                <td className="px-2 py-2 text-center text-blue-400">{s.podiums || '-'}</td>
                <td className="px-2 py-2 text-center text-red-400">{s.lastPlaces || '-'}</td>
                <td className="px-2 py-2 text-center text-purple-400">{s.finalTables || '-'}</td>
                <td className="px-2 py-2 text-center text-gray-500">{s.bubbles || '-'}</td>
              </tr>
            ))}
          </tbody>
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

// Componente para headers ordenables
function SortHeader({
  label,
  sortKey,
  current,
  onSort,
  title,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  onSort: (key: SortKey) => void
  title?: string
}) {
  return (
    <th
      className="px-2 py-3 text-center cursor-pointer hover:text-white transition"
      onClick={() => onSort(sortKey)}
      title={title}
    >
      {label}
      {current === sortKey && <span className="ml-1 text-green-400">•</span>}
    </th>
  )
}

// Card colapsable para mobile
function StandingCard({ standing: s }: { standing: PlayerStanding }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${getZoneBorder(s.position)}`}>
      {/* Card colapsada */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`font-bold text-lg ${getPositionClass(s.position)}`}>
              {s.position}°
            </span>
            <div>
              <div className="font-medium">{s.player.name}</div>
              <ZoneLabel position={s.position} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-400">{formatPoints(s.totalPoints)}</div>
            <div className="text-xs text-gray-500">puntos</div>
          </div>
        </div>

        {/* KPIs breves */}
        <div className="flex gap-4 mt-3 text-sm text-gray-400">
          <span>J: {s.eventsPlayed}</span>
          <span>MF: {s.finalTables}</span>
          <span>Últ: {s.lastPlaces}</span>
        </div>

        {/* Botón expandir */}
        <button
          className="mt-3 text-sm text-gray-500 hover:text-gray-300 transition"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {expanded ? '▲ Ocultar datos' : '▼ Ver datos'}
        </button>
      </div>

      {/* Card expandida */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-700">
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <StatBox label="🥇" value={s.golds} color="text-yellow-500" />
            <StatBox label="🥈" value={s.silvers} color="text-gray-300" />
            <StatBox label="🥉" value={s.bronzes} color="text-orange-400" />
            <StatBox label="4°" value={s.fourths} color="text-gray-400" />
            <StatBox label="5°" value={s.fifths} color="text-gray-400" />
            <StatBox label="6°" value={s.bubbles} color="text-gray-500" title="Burbuja" />
            <div className="col-span-2">
              <Link
                to={`/jugadores/${s.playerId}`}
                className="block py-2 text-center text-green-400 text-sm hover:underline"
              >
                Ver perfil →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({
  label,
  value,
  color,
  title,
}: {
  label: string
  value: number
  color: string
  title?: string
}) {
  return (
    <div title={title}>
      <div className={`font-bold ${color}`}>{value || '-'}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function ZoneLabel({ position }: { position: number }) {
  if (position <= 8) {
    return <span className="text-xs text-green-600">Final 7</span>
  }
  if (position <= 16) {
    return <span className="text-xs text-yellow-600">Fraca</span>
  }
  return null
}

function getPositionClass(position: number): string {
  if (position === 1) return 'text-yellow-400'
  if (position === 2) return 'text-gray-300'
  if (position === 3) return 'text-orange-400'
  return 'text-gray-400'
}

function getZoneClass(position: number): string {
  if (position <= 8) return 'bg-green-900/10'
  if (position <= 16) return 'bg-yellow-900/10'
  return ''
}

function getZoneBorder(position: number): string {
  if (position <= 8) return 'border-l-2 border-green-700'
  if (position <= 16) return 'border-l-2 border-yellow-700'
  return ''
}
