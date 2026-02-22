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

  // For Final Seven champion: use DB data, fallback to static data position 1
  const finalSevenChampion = champions.finalSeven ?? (
    !isSummer && finalData?.results[0]
      ? { name: finalData.results[0].name, id: finalData.results[0].playerKey }
      : null
  )

  // For Summer champion: use DB data, fallback to static data position 1
  const summerChampion = champions.summerChampion ?? (
    isSummer && finalData?.results[0]
      ? { name: finalData.results[0].name, id: finalData.results[0].playerKey }
      : null
  )

  return (
    <PageContainer>
    <div className="space-y-6">
      <PageHeader
        title={season.name}
        subtitle={`${statusLabel[season.status] ?? season.status}${season.finishedEvents > 0 ? ` · ${season.finishedEvents} fecha${season.finishedEvents !== 1 ? 's' : ''} jugada${season.finishedEvents !== 1 ? 's' : ''}` : ''}`}
        backTo="/historial"
        backLabel="Volver al historial"
      />

      {/* Champions section — only Final Seven + Regular (no Fraca) */}
      {season.status === 'finished' && (
        <motion.div variants={fadeIn} initial="initial" animate="animate">
          {isSummer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HeroChampionCard
                title="Temporada Regular"
                player={regularChampion}
                accentColor="accent"
              />
              <HeroChampionCard
                title="Summer Champion"
                player={summerChampion}
                accentColor="gold"
                showLaurels
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HeroChampionCard
                title="Final Seven"
                player={finalSevenChampion}
                accentColor="gold"
                showLaurels
              />
              <HeroChampionCard
                title="Temporada Regular"
                player={regularChampion}
                accentColor="accent"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Final Seven / Summer Cup Results table (no photos) */}
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

/* ─── Hero Champion Card (big, with photo + optional laurels) ─── */

function HeroChampionCard({
  title,
  player,
  accentColor,
  showLaurels = false,
}: {
  title: string
  player: { name: string; id: string } | null
  accentColor: 'gold' | 'accent'
  showLaurels?: boolean
}) {
  const [photoError, setPhotoError] = useState(false)
  const photoSrc = player ? `/Players/${player.id}.png` : ''

  const colors = {
    gold: {
      gradient: 'from-yellow-500/15 via-surface-2/80 to-surface-1',
      ring: 'ring-gold/40',
      titleColor: 'text-gold',
      nameColor: 'text-gold font-bold',
      border: 'border-yellow-500/20 hover:border-yellow-500/40',
    },
    accent: {
      gradient: 'from-accent/10 via-surface-2/80 to-surface-1',
      ring: 'ring-accent/30',
      titleColor: 'text-accent-light',
      nameColor: 'text-text-primary font-semibold',
      border: 'border-glass-border hover:border-accent/30',
    },
  }[accentColor]

  return (
    <div className={`relative rounded-xl overflow-hidden border ${colors.border} transition-all duration-300`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`} />
      <div className="relative flex flex-col items-center gap-3 p-6 py-8">
        {/* Laurels behind photo */}
        {showLaurels && (
          <img
            src="/laureles.png"
            alt=""
            className="absolute top-3 left-1/2 -translate-x-1/2 w-36 h-36 object-contain opacity-15 pointer-events-none"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}

        {/* Photo */}
        {player && (
          <Link to={`/jugadores/${player.id}`} className="group relative z-10">
            <div className={`relative w-24 h-24 rounded-full overflow-hidden bg-surface-3/50 ring-2 ${colors.ring}`}>
              {!photoError ? (
                <img
                  src={photoSrc}
                  alt={player.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl opacity-40">
                  🐵
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Title */}
        <div className={`text-sm font-medium ${colors.titleColor} relative z-10`}>{title}</div>

        {/* Name */}
        {player ? (
          <Link
            to={`/jugadores/${player.id}`}
            className={`text-xl ${colors.nameColor} hover:underline relative z-10`}
          >
            {player.name}
          </Link>
        ) : (
          <div className="text-text-tertiary text-lg relative z-10">-</div>
        )}
      </div>
    </div>
  )
}

/* ─── Final Results Table (no photos) ─── */

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
  const isMedal = result.position <= 3
  const medalIdx = result.position - 1

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
