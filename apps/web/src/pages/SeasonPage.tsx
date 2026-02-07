import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeason } from '../hooks/useSeason'
import { useSeasonEvents } from '../hooks/useSeasonEvents'
import { useStandings } from '../hooks/useStandings'
import { StandingsTable } from '../components/StandingsTable'
import { GlassCard, PageHeader, TableSkeleton } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'

export function SeasonPage() {
  const { seasonId } = useParams()
  const { season, champions, loading: seasonLoading, error: seasonError } = useSeason(seasonId)
  const { events, loading: eventsLoading } = useSeasonEvents(seasonId)
  const { standings, loading: standingsLoading, error: standingsError } = useStandings(seasonId ?? null)

  const loading = seasonLoading || eventsLoading || standingsLoading
  const error = seasonError || standingsError

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cargando..." backTo="/historial" backLabel="Volver al historial" />
        <TableSkeleton rows={10} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Error" backTo="/historial" backLabel="Volver al historial" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
    )
  }

  if (!season) {
    return (
      <div className="space-y-6">
        <PageHeader title="No encontrada" backTo="/historial" backLabel="Volver al historial" />
        <GlassCard className="p-8 text-center text-text-secondary">Temporada no encontrada</GlassCard>
      </div>
    )
  }

  const statusLabel: Record<string, string> = {
    active: 'En curso',
    finished: 'Finalizado',
    upcoming: 'Próximo',
  }

  const regularChampion = champions.regular ?? standings[0]?.player ?? null
  const isSummer = season.type === 'summer'

  return (
    <div className="space-y-6">
      <PageHeader
        title={season.name}
        subtitle={`${statusLabel[season.status] ?? season.status}${season.finishedEvents > 0 ? ` · ${season.finishedEvents} fecha${season.finishedEvents !== 1 ? 's' : ''} jugada${season.finishedEvents !== 1 ? 's' : ''}` : ''}`}
        backTo="/historial"
        backLabel="Volver al historial"
      />

      {/* Header de campeones */}
      {season.status === 'finished' && (
        <motion.div variants={fadeIn} initial="initial" animate="animate">
          <GlassCard as="section" className="p-6">
            <h2 className="text-lg font-medium mb-4">Campeones</h2>
            {isSummer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <ChampionCard title="Temporada Regular" player={regularChampion} highlight={false} />
                <ChampionCard title="Summer Champion" player={champions.summerChampion} highlight />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <ChampionCard title="Final Seven" player={champions.finalSeven} highlight />
                <ChampionCard title="Temporada Regular" player={regularChampion} highlight={false} />
                <ChampionCard title="Fraca" player={champions.fraca} highlight={false} />
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Tabla de posiciones */}
      <motion.section variants={fadeIn} initial="initial" animate="animate">
        <GlassCard className="p-6">
          <h2 className="text-lg font-medium mb-4">
            {season.status === 'finished' ? 'Tabla Final' : 'Tabla de Posiciones'}
          </h2>
          {standings.length > 0 ? (
            <StandingsTable
              standings={standings}
              currentEvent={season.finishedEvents}
              totalEvents={season.totalEvents || undefined}
            />
          ) : (
            <div className="text-text-secondary text-center py-8">
              No hay resultados registrados
            </div>
          )}
        </GlassCard>
      </motion.section>

      {/* Lista de fechas */}
      {events.length > 0 && (
        <motion.section variants={fadeIn} initial="initial" animate="animate">
          <GlassCard className="p-6">
            <h2 className="text-lg font-medium mb-4">Fechas</h2>
            <motion.div
              className="grid gap-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {events.map((event) => (
                <motion.div key={event.id} variants={staggerItem}>
                  <Link
                    to={`/historial/${seasonId}/${event.id}`}
                    className="flex items-center justify-between p-3 bg-glass-hover/50 hover:bg-glass-hover rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-text-secondary">#{event.number}</span>
                      <span className="text-text-tertiary">
                        {event.date.toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                    <EventStatusBadge status={event.status} />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.section>
      )}
    </div>
  )
}

function ChampionCard({
  title,
  player,
  highlight,
}: {
  title: string
  player: { name: string; id: string } | null
  highlight: boolean
}) {
  const bgClass = highlight ? 'bg-gold/10' : ''
  const titleClass = highlight ? 'text-gold' : 'text-text-tertiary'
  const nameClass = highlight ? 'font-bold text-gold' : 'font-medium'

  return (
    <div className={`${bgClass} rounded-lg p-3`}>
      <div className={`text-sm ${titleClass}`}>{title}</div>
      {player ? (
        <Link
          to={`/jugadores/${player.id}`}
          className={`${nameClass} hover:underline`}
        >
          {player.name}
        </Link>
      ) : (
        <div className="text-text-tertiary">-</div>
      )}
    </div>
  )
}

function EventStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { label: string; class: string }> = {
    finished: { label: 'Finalizado', class: 'bg-surface-4/50 text-text-secondary' },
    live: { label: 'En vivo', class: 'bg-success/15 text-success' },
    scheduled: { label: 'Próximo', class: 'bg-blue-500/15 text-blue-400' },
  }

  const style = styles[status] ?? { label: status, class: 'bg-surface-3 text-text-secondary' }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.class}`}>
      {style.label}
    </span>
  )
}
