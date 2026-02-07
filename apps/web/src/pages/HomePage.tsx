import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeasons } from '../hooks/useSeasons'
import { useStandings } from '../hooks/useStandings'
import { useLastPodium } from '../hooks/useLastPodium'
import { StandingsTable } from '../components/StandingsTable'
import { GlassCard, TableSkeleton } from '../components/ui'
import { staggerContainer, staggerItem } from '../lib/motion'

export function HomePage() {
  const { activeSeason, loading: seasonsLoading } = useSeasons()
  const { standings, loading: standingsLoading } = useStandings(activeSeason?.id ?? null)
  const { podium, eventNumber, loading: podiumLoading } = useLastPodium(activeSeason?.id ?? null)

  const isLoading = seasonsLoading || standingsLoading || podiumLoading

  // Reordenar podio: [2°, 1°, 3°] para display
  const podiumDisplay = podium.length === 3
    ? [podium[1], podium[0], podium[2]] // 2°, 1°, 3°
    : podium

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section
        className="relative text-center py-10 md:py-14 rounded-2xl overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-3/50 to-surface-1 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -z-10" />

        <h1 className="sr-only">La Granja Poker</h1>
        <motion.img
          src="/logo%20vertical.png"
          alt="La Granja Poker"
          className="mx-auto mb-4 w-full max-w-[220px] md:max-w-[260px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.p
          className="text-lg md:text-xl text-text-secondary italic"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          "No tratés de entenderla, disfrutála"
        </motion.p>

        {/* Podio de la última fecha */}
        {!podiumLoading && podium.length > 0 && (
          <motion.div
            className="mt-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <p className="text-sm text-text-tertiary mb-5">
              Podio Fecha #{eventNumber}
            </p>
            <div className="flex justify-center items-end gap-4 md:gap-8">
              {podiumDisplay.map((entry, idx) => entry && (
                <motion.div key={entry.player.id} variants={staggerItem}>
                  <PodiumSlot
                    position={entry.position}
                    name={entry.player.name}
                    isCenter={idx === 1}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {podiumLoading && (
          <div className="mt-8 flex justify-center gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-3/60 animate-pulse mx-auto" />
                <div className="w-10 h-3 rounded bg-surface-3/60 animate-pulse mx-auto" />
                <div className="w-14 h-3 rounded bg-surface-3/60 animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tabla del torneo actual */}
      <section>
        {isLoading ? (
          <TableSkeleton rows={10} />
        ) : standings.length === 0 ? (
          <GlassCard className="p-8 text-center text-text-secondary">
            No hay resultados registrados para esta temporada
          </GlassCard>
        ) : (
          <StandingsTable
            standings={standings}
            seasonName={activeSeason?.name}
            currentEvent={eventNumber ?? undefined}
            totalEvents={activeSeason?.totalEvents}
          />
        )}
      </section>

      {/* Cards de navegación */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassCard hoverable className="block">
            <Link to="/hall-of-fame" className="block p-6">
              <h3 className="text-xl font-bold text-gold mb-1">Hall of Fame</h3>
              <p className="text-text-secondary text-sm">Los campeones de La Granja</p>
            </Link>
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <GlassCard hoverable className="block">
            <Link to="/jugadores" className="block p-6">
              <h3 className="text-xl font-bold text-accent-light mb-1">Jugadores</h3>
              <p className="text-text-secondary text-sm">Directorio y perfiles</p>
            </Link>
          </GlassCard>
        </motion.div>
      </motion.section>
    </div>
  )
}

function PodiumSlot({
  position,
  name,
  isCenter,
}: {
  position: number
  name: string
  isCenter: boolean
}) {
  const positionStyles = {
    1: { ring: 'ring-gold', text: 'text-gold', size: 'w-20 h-20 md:w-24 md:h-24', glow: 'shadow-gold-glow' },
    2: { ring: 'ring-silver', text: 'text-silver', size: 'w-16 h-16 md:w-20 md:h-20', glow: '' },
    3: { ring: 'ring-bronze', text: 'text-bronze', size: 'w-16 h-16 md:w-20 md:h-20', glow: '' },
  }

  const style = positionStyles[position as 1 | 2 | 3] ?? positionStyles[3]

  return (
    <div className={`text-center ${isCenter ? '-mt-4' : ''}`}>
      <div
        className={`${style.size} bg-surface-3 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl md:text-3xl ${isCenter ? `ring-4 ${style.ring} ${style.glow}` : ''}`}
      >
        🐵
      </div>
      <div className={`font-bold ${style.text}`}>{position}°</div>
      <div className="text-sm text-text-secondary max-w-[80px] truncate">{name}</div>
    </div>
  )
}
