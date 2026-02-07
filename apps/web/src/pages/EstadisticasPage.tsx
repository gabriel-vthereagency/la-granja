import { motion } from 'framer-motion'
import { useStats } from '../hooks/useStats'
import { formatPoints } from '../utils/formatPoints'
import { GlassCard, CardSkeleton, PageHeader } from '../components/ui'
import { staggerContainer, staggerItem, staggerFast, tableRow } from '../lib/motion'

export function EstadisticasPage() {
  const { stats, loading, error } = useStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Estadísticas" />
        <div className="grid gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Estadísticas" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Estadísticas" />

      <motion.div
        className="grid gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <StatsTable title="Top Podios (Top 5)" data={stats.topPodiums} accent="border-l-blue-400" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsTable title="Top Victorias (1°)" data={stats.topWins} accent="border-l-gold" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsTable title="Top Últimos Puestos" data={stats.topLastPlaces} accent="border-l-accent" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsTable title="Top Burbujas (6°)" data={stats.topBubbles} accent="border-l-text-tertiary" />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsTable
            title="Top Efectividad"
            data={stats.topEffectiveness}
            formatValue={(v) => formatPoints(v)}
            accent="border-l-purple-400"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatsTable title="Top Presencias" data={stats.topPresences} accent="border-l-success" />
        </motion.div>
      </motion.div>
    </div>
  )
}

function StatsTable({
  title,
  data,
  formatValue,
  accent = '',
}: {
  title: string
  data: Array<{ rank: number; player: string; value: number }>
  formatValue?: (value: number) => string
  accent?: string
}) {
  return (
    <div className={`bg-glass border border-glass-border rounded-xl overflow-hidden ${accent ? `border-l-2 ${accent}` : ''}`}>
      <h2 className="px-4 py-3 bg-surface-2/80 backdrop-blur-sm font-medium text-text-primary">{title}</h2>
      <table className="w-full">
        <thead>
          <tr className="text-sm text-text-tertiary">
            <th className="px-4 py-2 text-left w-12">#</th>
            <th className="px-4 py-2 text-left">Jugador</th>
            <th className="px-4 py-2 text-right">Cantidad</th>
          </tr>
        </thead>
        <motion.tbody variants={staggerFast} initial="initial" animate="animate">
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-text-tertiary">
                Sin datos
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <motion.tr
                key={row.rank}
                variants={tableRow}
                className="border-t border-glass-border hover:bg-glass-hover transition"
              >
                <td className="px-4 py-2 text-text-tertiary">{row.rank}</td>
                <td className="px-4 py-2">{row.player}</td>
                <td className="px-4 py-2 text-right text-success">
                  {formatValue ? formatValue(row.value) : row.value}
                </td>
              </motion.tr>
            ))
          )}
        </motion.tbody>
      </table>
    </div>
  )
}
