import type { TournamentStats } from '@lagranja/core'

interface StatsRowProps {
  stats: TournamentStats
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="bottom-row">
      <div className="stat-card">
        <div className="stat-label">Activos / Totales</div>
        <div className="stat-value">
          {stats.playersActive} / {stats.playersRegistered}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Recompras</div>
        <div className="stat-value">{stats.totalRebuys}</div>
      </div>

      <div className="logo-container">
        <img src="/logo.png" alt="La Granja Poker Club" className="club-logo" />
      </div>

      <div className="stat-card">
        <div className="stat-label">Fichas totales</div>
        <div className="stat-value">{stats.totalChips.toLocaleString('es-AR')}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Avg Stack</div>
        <div className="stat-value">{stats.averageStack.toLocaleString('es-AR')}</div>
      </div>
    </div>
  )
}
