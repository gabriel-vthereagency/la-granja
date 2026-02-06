import type { TournamentStats } from '@lagranja/core'

interface PlayerStatsProps {
  stats: TournamentStats
}

export function PlayerStats({ stats }: PlayerStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Jugadores"
        value={`${stats.playersActive}/${stats.playersRegistered}`}
        sublabel="activos / total"
      />
      <StatCard
        label="Eliminados"
        value={stats.playersEliminated.toString()}
      />
      <StatCard
        label="Recompras"
        value={stats.totalRebuys.toString()}
      />
      <StatCard
        label="Average"
        value={stats.averageStack.toLocaleString('es-AR')}
        sublabel="fichas"
      />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sublabel?: string
}

function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 text-center">
      <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sublabel && (
        <div className="text-gray-500 text-xs mt-1">{sublabel}</div>
      )}
    </div>
  )
}
