import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeason } from '../hooks/useSeason'
import { useSeasonEvents } from '../hooks/useSeasonEvents'
import { useStandings } from '../hooks/useStandings'
import { StandingsTable } from '../components/StandingsTable'
import { GlassCard, PageHeader, TableSkeleton, PageContainer } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'
import { getFinalForSeason } from '../data/finals'
import type { FinalResult } from '../data/finals'

const MEDAL_COLORS = ['text-gold', 'text-silver', 'text-bronze']
const MEDAL_BG = ['bg-gold/10', 'bg-silver/10', 'bg-bronze/10']
const MEDAL_EMOJI = ['🥇', '🥈', '🥉']

export function SeasonPage() {
  const { seasonId } = useParams()
  const { season, champions, loading: seasonLoading, error: seasonError } = useSeason(seasonId)
  const { events, loading: eventsLoading } = useSeasonEvents(seasonId)
  const { standings, loading: standingsLoading, error: standingsError } = useStandings(seasonId ?? null)

  const loading = seasonLoading || eventsLoading || standingsLoading
  const error = seasonError || standingsError

  if (loading) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Cargando..." backTo="/historial" backLabel="Volver al historial" />
        <TableSkeleton rows={10} />
      </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Error" backTo="/historial" backLabel="Volver al historial" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
      </PageContainer>
    )
  }

  if (!season) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="No encontrada" backTo="/historial" backLabel="Volver al historial" />
        <GlassCard className="p-8 text-center text-text-secondary">Temporada no encontrada</GlassCard>
      </div>
      </PageContainer>
    )
  }

  const statusLabel: Record<string, string> = {
    active: 'En curso',
    finished: 'Finalizado',
    upcoming: 'Próximo',
  }

  const regularChampion = champions.regular ?? standings[0]?.player ?? null
  const isSummer = season.type === 'summer'
  const finalData = getFinalForSeason(season.type, season.year)

  return (
    <PageContainer>
    <div className="space-y-6">
      <PageHeader
        title={season.name}
        subtitle={`${statusLabel[season.status] ?? season.status}${season.finishedEvents > 0 ? ` · ${season.finishedEvents} fecha${season.finishedEvents !== 1 ? 's' : ''} jugada${season.finishedEvents !== 1 ? 's' : ''}` : ''}`}
        backTo="/historial"
        backLabel="Volver al historial"
      />

      {/* Champions section with photos */}
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

      {/* Final Seven / Summer Cup Results table */}
      {finalData && (
        <motion.section variants={fadeIn} initial="initial" animate="animate">
          <GlassCard className="p-6">
            <h2 className="text-lg font-medium mb-4">
              {isSummer ? 'Summer Cup — Mesa Final' : 'Final Seven'}
            </h2>
            <FinalResultsTable results={finalData.results} />
          </GlassCard>
        </motion.section>
      )}

      {/* Standings table */}
      <motion.section variants={fadeIn} initial="initial" animate="animate">
        <GlassCard className="p-6">
          <h2 className="text-lg font-medium mb-4">
            {season.status === 'finished' ? 'Tabla Final — Torneo Regular' : 'Tabla de Posiciones'}
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

      {/* Event dates list */}
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
    </PageContainer>
  )
}

/* ─── Final Results Table ─── */

function FinalResultsTable({ results }: { results: FinalResult[] }) {
  return (
    <motion.div
      className="space-y-1.5"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {results.map((r) => (
        <FinalResultRow key={r.position} result={r} />
      ))}
    </motion.div>
  )
}

function FinalResultRow({ result }: { result: FinalResult }) {
  const [photoError, setPhotoError] = useState(false)
  const isMedal = result.position <= 3
  const medalIdx = result.position - 1
  const photoSrc = `/Players/${result.playerKey}.png`

  return (
    <motion.div
      variants={staggerItem}
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition ${
        isMedal
          ? `${MEDAL_BG[medalIdx]} border border-white/[0.06]`
          : 'bg-surface-2/30 hover:bg-surface-2/50'
      }`}
    >
      {/* Position */}
      <div className={`w-8 text-center font-bold text-lg ${isMedal ? MEDAL_COLORS[medalIdx] : 'text-text-tertiary'}`}>
        {isMedal ? MEDAL_EMOJI[medalIdx] : result.position}
      </div>

      {/* Player photo */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-3/50 shrink-0">
        {!photoError ? (
          <img
            src={photoSrc}
            alt={result.name}
            loading="lazy"
            className="w-full h-full object-cover object-top"
            onError={() => setPhotoError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg opacity-40">
            🐵
          </div>
        )}
        {result.position === 1 && (
          <div className="absolute inset-0 rounded-full ring-2 ring-gold/40" />
        )}
      </div>

      {/* Name */}
      <span className={`font-medium flex-1 ${isMedal ? 'text-text-primary' : 'text-text-secondary'}`}>
        {result.name}
      </span>

      {/* Position number for medal rows */}
      {isMedal && (
        <span className={`text-sm font-semibold ${MEDAL_COLORS[medalIdx]}`}>
          #{result.position}
        </span>
      )}
    </motion.div>
  )
}

/* ─── Champion Card with photo ─── */

function ChampionCard({
  title,
  player,
  highlight,
}: {
  title: string
  player: { name: string; id: string } | null
  highlight: boolean
}) {
  const [photoError, setPhotoError] = useState(false)
  const bgClass = highlight ? 'bg-gold/10' : ''
  const titleClass = highlight ? 'text-gold' : 'text-text-tertiary'
  const nameClass = highlight ? 'font-bold text-gold' : 'font-medium'
  const photoSrc = player ? `/Players/${player.id}.png` : ''

  return (
    <div className={`${bgClass} rounded-lg p-4 flex flex-col items-center gap-2`}>
      {/* Photo */}
      {player && (
        <Link to={`/jugadores/${player.id}`} className="group">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-3/50">
            {!photoError ? (
              <img
                src={photoSrc}
                alt={player.name}
                loading="lazy"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">
                🐵
              </div>
            )}
            {highlight && (
              <div className="absolute inset-0 rounded-full ring-2 ring-gold/40" />
            )}
          </div>
        </Link>
      )}
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
