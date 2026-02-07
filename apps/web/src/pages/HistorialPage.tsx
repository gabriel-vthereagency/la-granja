import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeasons } from '../hooks/useSeasons'
import { GlassCard, CardSkeleton, PageHeader } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'

export function HistorialPage() {
  const { seasons, loading, error } = useSeasons()

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Historial de Torneos" />
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Historial de Torneos" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
    )
  }

  const byYear = seasons.reduce(
    (acc, s) => {
      const bucket = acc[s.year] ?? []
      bucket.push(s)
      acc[s.year] = bucket
      return acc
    },
    {} as Record<number, typeof seasons>
  )

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)

  const typeColors: Record<string, string> = {
    apertura: 'border-l-accent',
    clausura: 'border-l-blue-400',
    summer: 'border-l-gold',
  }

  const statusBadge: Record<string, { label: string; class: string }> = {
    active: { label: 'En curso', class: 'bg-accent-muted text-accent-light' },
    finished: { label: 'Finalizado', class: 'bg-surface-4/50 text-text-secondary' },
    upcoming: { label: 'Próximo', class: 'bg-blue-500/15 text-blue-400' },
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Historial de Torneos" />

      {years.map((year) => {
        const seasonsForYear = byYear[year] ?? []
        return (
          <motion.div key={year} variants={fadeIn} initial="initial" animate="animate">
            <h2 className="text-lg font-medium text-text-tertiary mb-3">{year}</h2>
            <motion.div
              className="grid gap-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {seasonsForYear.map((season) => (
                <motion.div key={season.id} variants={staggerItem}>
                  <GlassCard hoverable>
                    <Link
                      to={`/historial/${season.id}`}
                      className={`block p-5 border-l-4 rounded-xl ${typeColors[season.type] ?? ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">{season.name}</h3>
                          <p className="text-text-tertiary text-sm capitalize">{season.type}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[season.status]?.class ?? 'bg-surface-3 text-text-secondary'}`}
                        >
                          {statusBadge[season.status]?.label ?? season.status}
                        </span>
                      </div>
                    </Link>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )
      })}

      {seasons.length === 0 && (
        <GlassCard className="p-8 text-center text-text-secondary">
          No hay temporadas registradas
        </GlassCard>
      )}
    </div>
  )
}
