import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEventResults } from '../hooks/useEventResults'
import { formatPoints } from '../utils/formatPoints'
import { GlassCard, AnimatedCounter, PageHeader, TableSkeleton, PageContainer } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem, staggerFast, tableRow } from '../lib/motion'

export function EventDetailPage() {
  const { seasonId, eventId } = useParams()
  const { event, results, loading, error } = useEventResults(eventId)

  if (loading) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Cargando..."
          backTo={`/historial/${seasonId}`}
          backLabel="Volver a la temporada"
        />
        <div className="flex justify-center gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="w-16 h-16 rounded-lg bg-surface-3/60 animate-pulse mx-auto" />
              <div className="w-14 h-3 rounded bg-surface-3/60 animate-pulse mx-auto" />
            </div>
          ))}
        </div>
        <TableSkeleton rows={10} />
      </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Error" backTo={`/historial/${seasonId}`} backLabel="Volver a la temporada" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
      </PageContainer>
    )
  }

  if (!event) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="No encontrada" backTo={`/historial/${seasonId}`} backLabel="Volver a la temporada" />
        <GlassCard className="p-8 text-center text-text-secondary">Fecha no encontrada</GlassCard>
      </div>
      </PageContainer>
    )
  }

  const sortedResults = [...results].sort((a, b) => a.position - b.position)

  const totalPlayers = sortedResults.length
  const totalRebuys = sortedResults.reduce((sum, r) => sum + r.rebuys, 0)
  const totalPrize = sortedResults.reduce((sum, r) => sum + r.prize, 0)

  const first = sortedResults.find((r) => r.position === 1)
  const second = sortedResults.find((r) => r.position === 2)
  const third = sortedResults.find((r) => r.position === 3)

  const podium = first && second && third ? { first, second, third } : null

  return (
    <PageContainer>
    <div className="space-y-6">
      <PageHeader
        title={`Fecha #${event.number}`}
        subtitle={event.date.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        backTo={`/historial/${seasonId}`}
        backLabel={`Volver a ${event.seasonName}`}
      />

      {/* Podio */}
      {podium && (
        <motion.div variants={fadeIn} initial="initial" animate="animate">
          <GlassCard as="section" className="p-6">
            <h2 className="text-lg font-medium mb-4 text-center text-text-secondary">Podio</h2>
            <motion.div
              className="flex justify-center items-end gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* 2° puesto */}
              <motion.div className="text-center" variants={staggerItem}>
                <div className="bg-surface-3 rounded-lg p-4 mb-2">
                  <div className="text-3xl">🥈</div>
                </div>
                <Link
                  to={`/jugadores/${podium.second.player.id}`}
                  className="font-medium hover:text-accent-light transition"
                >
                  {podium.second.player.name}
                </Link>
                <div className="text-sm text-text-tertiary">{formatPoints(podium.second.points)} pts</div>
              </motion.div>

              {/* 1° puesto */}
              <motion.div
                className="text-center -mb-4"
                variants={staggerItem}
              >
                <div className="bg-gold/10 rounded-lg p-6 mb-2 border border-gold/30 shadow-gold-glow">
                  <div className="text-5xl">🥇</div>
                </div>
                <Link
                  to={`/jugadores/${podium.first.player.id}`}
                  className="font-bold text-gold hover:text-gold/80 transition"
                >
                  {podium.first.player.name}
                </Link>
                <div className="text-sm text-gold/70">{formatPoints(podium.first.points)} pts</div>
              </motion.div>

              {/* 3° puesto */}
              <motion.div className="text-center" variants={staggerItem}>
                <div className="bg-bronze/10 rounded-lg p-4 mb-2">
                  <div className="text-3xl">🥉</div>
                </div>
                <Link
                  to={`/jugadores/${podium.third.player.id}`}
                  className="font-medium hover:text-accent-light transition"
                >
                  {podium.third.player.name}
                </Link>
                <div className="text-sm text-text-tertiary">{formatPoints(podium.third.points)} pts</div>
              </motion.div>
            </motion.div>
          </GlassCard>
        </motion.div>
      )}

      {/* Stats resumen */}
      <motion.section
        className="grid grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <AnimatedCounter value={totalPlayers} className="text-2xl font-bold text-blue-400" />
            <div className="text-sm text-text-tertiary">Jugadores</div>
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <AnimatedCounter value={totalRebuys} className="text-2xl font-bold text-purple-400" />
            <div className="text-sm text-text-tertiary">Recompras</div>
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              $<AnimatedCounter
                value={totalPrize}
                format={(v) => Math.round(v).toLocaleString('es-AR')}
              />
            </div>
            <div className="text-sm text-text-tertiary">Pozo Total</div>
          </GlassCard>
        </motion.div>
      </motion.section>

      {/* Tabla de resultados */}
      <motion.section variants={fadeIn} initial="initial" animate="animate">
        <div className="bg-glass border border-glass-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-2/80 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-text-tertiary">#</th>
                <th className="px-4 py-3 text-left text-sm text-text-tertiary">Jugador</th>
                <th className="px-4 py-3 text-center text-sm text-text-tertiary">Pts</th>
                <th className="px-4 py-3 text-center text-sm text-text-tertiary" title="Recompras">R</th>
                <th className="px-4 py-3 text-right text-sm text-text-tertiary">Premio</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerFast} initial="initial" animate="animate">
              {sortedResults.length > 0 ? (
                sortedResults.map((r) => (
                  <motion.tr
                    key={r.player.id}
                    variants={tableRow}
                    className={`border-t border-glass-border hover:bg-glass-hover transition ${getRowClass(r.position)}`}
                  >
                    <td className="px-4 py-3">
                      <span className={getPositionClass(r.position)}>{r.position}°</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/jugadores/${r.player.id}`}
                        className="hover:text-accent-light transition"
                      >
                        {r.player.name}
                      </Link>
                    </td>
                    <td className={`px-4 py-3 text-center font-medium ${getPointsClass(r.points)}`}>
                      {formatPoints(r.points)}
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">
                      {r.rebuys > 0 ? r.rebuys : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-success">
                      {r.prize > 0 ? `$${r.prize.toLocaleString('es-AR')}` : '-'}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-text-secondary" colSpan={5}>
                    No hay resultados registrados
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.section>
    </div>
    </PageContainer>
  )
}

function getPositionClass(position: number): string {
  if (position === 1) return 'font-bold text-gold'
  if (position === 2) return 'font-medium text-silver'
  if (position === 3) return 'font-medium text-bronze'
  return 'text-text-secondary'
}

function getPointsClass(points: number): string {
  if (points >= 16) return 'text-gold'
  if (points >= 10) return 'text-silver'
  if (points >= 7) return 'text-bronze'
  if (points >= 4) return 'text-blue-400'
  if (points >= 2) return 'text-purple-400'
  return 'text-text-tertiary'
}

function getRowClass(position: number): string {
  if (position <= 5) return 'bg-accent/3'
  return ''
}
