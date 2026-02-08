import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeasons } from '../hooks/useSeasons'
import { useStandings } from '../hooks/useStandings'
import { useLastPodium, type PodiumEntry } from '../hooks/useLastPodium'
import { StandingsTable } from '../components/StandingsTable'
import { GlassCard, PageContainer, TableSkeleton } from '../components/ui'
import {
  heroTitle,
  heroFadeUp,
  heroScale,
  floatSlow,
  bounceDown,
  staggerContainer,
  staggerItem,
} from '../lib/motion'

export function HomePage() {
  const { activeSeason, loading: seasonsLoading } = useSeasons()
  const { standings, loading: standingsLoading } = useStandings(activeSeason?.id ?? null)
  const { podium, eventNumber, loading: podiumLoading } = useLastPodium(activeSeason?.id ?? null)

  const isLoading = seasonsLoading || standingsLoading || podiumLoading

  function scrollToStandings() {
    document.getElementById('standings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* ═══ HERO — Full-screen, full-width ═══ */}
      <section className="relative h-[100svh] flex flex-col overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-surface-1" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 30%, rgba(239,68,68,0.08) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 75% 50%, rgba(234,179,8,0.05) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]" />

        {/* Floating poker suit decorations */}
        <FloatingDecorations />

        {/* Hero content — grows to fill available space, centers children */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-12 items-center">
            {/* LEFT COLUMN — Text + CTA */}
            <div className="md:col-span-7 space-y-2 md:space-y-6">
              {/* Season pill */}
              <motion.div
                variants={heroFadeUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full bg-accent-muted text-accent-light text-xs md:text-sm font-medium border border-accent/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {activeSeason?.name ?? 'La Granja Poker'}
                </span>
              </motion.div>

              {/* Logo + Tagline (same width container) */}
              <div className="w-56 md:w-96 lg:w-[480px]">
                <motion.div
                  variants={heroTitle}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2 }}
                >
                  <img
                    src="/logo2.png"
                    alt="La Granja Poker Club"
                    className="w-full h-auto"
                  />
                </motion.div>
                <motion.p
                  className="mt-2 md:mt-4 text-xs md:text-lg lg:text-xl text-text-secondary tracking-wide"
                  style={{ fontFamily: 'var(--font-nav)' }}
                  variants={heroFadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                >
                  No tratés de entenderla, disfrutála
                </motion.p>
              </div>

              {/* CTA Button */}
              <motion.div
                variants={heroFadeUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={scrollToStandings}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 md:gap-2.5 md:px-7 md:py-3.5 bg-[#b91c1c] hover:bg-[#dc2626] text-white text-sm md:text-base font-semibold rounded-xl transition-all duration-200"
                  style={{ boxShadow: '0 0 40px rgba(239,68,68,0.3), 0 0 80px rgba(239,68,68,0.15), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                >
                  Ver Tabla de Posiciones
                  <motion.svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="md:w-4 md:h-4"
                    variants={bounceDown}
                    animate="animate"
                  >
                    <path
                      d="M8 3v10m0 0l-4-4m4 4l4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </button>
              </motion.div>
            </div>

            {/* RIGHT COLUMN — Podium with player photos */}
            <div className="md:col-span-5">
              <HeroPodium
                podium={podium}
                eventNumber={eventNumber}
                loading={podiumLoading}
              />
            </div>
            </div>
          </div>
        </div>

        {/* Hero bottom cards — in flow, pinned to bottom */}
        <div className="relative z-10 shrink-0">
          <div className="mx-auto max-w-7xl px-6 pb-6 md:pb-8">
            <div className="mx-auto max-w-7xl px-6">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {/* Hall of Fame card */}
                <motion.div variants={staggerItem}>
                  <Link
                    to="/hall-of-fame"
                    className="group relative block overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] to-transparent backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:shadow-[0_0_30px_rgba(234,179,8,0.12)]"
                  >
                    <div className="relative z-10 p-4 md:p-6">
                      <h3 className="text-base md:text-xl font-bold text-gold mb-0.5 md:mb-1" style={{ fontFamily: 'var(--font-nav)' }}>
                        Hall of Fame
                      </h3>
                      <p className="text-text-secondary text-xs md:text-sm">Los campeones de La Granja</p>
                    </div>
                    {/* Clipped tilted badge */}
                    <img
                      src="/hof.png"
                      alt=""
                      className="absolute -right-2 -bottom-2 w-20 h-20 md:-right-4 md:-bottom-4 md:w-40 md:h-40 object-contain opacity-20 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none select-none"
                      style={{ transform: 'rotate(15deg)' }}
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>

                {/* Jugadores card */}
                <motion.div variants={staggerItem}>
                  <Link
                    to="/jugadores"
                    className="group relative block overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-transparent backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.12)]"
                  >
                    <div className="relative z-10 p-4 md:p-6">
                      <h3 className="text-base md:text-xl font-bold text-accent-light mb-0.5 md:mb-1" style={{ fontFamily: 'var(--font-nav)' }}>
                        Jugadores
                      </h3>
                      <p className="text-text-secondary text-xs md:text-sm">Directorio y perfiles</p>
                    </div>
                    {/* Clipped tilted monkey */}
                    <img
                      src="/mono.png"
                      alt=""
                      className="absolute -right-2 -bottom-2 w-20 h-20 md:-right-4 md:-bottom-4 md:w-40 md:h-40 object-contain opacity-20 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none select-none"
                      style={{ transform: 'rotate(-12deg)' }}
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT — Constrained width ═══ */}
      <PageContainer>
        <div className="space-y-8">
          {/* Standings table */}
          <section id="standings" className="scroll-mt-20">
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
        </div>
      </PageContainer>
    </>
  )
}

/* ─── Hero Podium ─── */

function HeroPodium({
  podium,
  eventNumber,
  loading,
}: {
  podium: PodiumEntry[]
  eventNumber: number | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-text-tertiary animate-pulse">Cargando podio...</div>
        <div className="flex items-end justify-center gap-4">
          {[80, 112, 80].map((size, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="rounded-full bg-surface-3/60 animate-pulse"
                style={{ width: size, height: size }}
              />
              <div className="w-12 h-3 rounded bg-surface-3/60 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (podium.length === 0) return null

  const first = podium.find((p) => p.position === 1)
  const second = podium.find((p) => p.position === 2)
  const third = podium.find((p) => p.position === 3)

  return (
    <motion.div
      className="flex flex-col items-center"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {eventNumber && (
        <motion.p
          className="text-sm text-text-tertiary mb-3 md:mb-6"
          variants={heroFadeUp}
        >
          Podio Fecha #{eventNumber}
        </motion.p>
      )}

      {/* Horizontal layout: 2nd — 1st — 3rd */}
      <div className="flex items-end justify-center gap-3 md:gap-6">
        {second && (
          <motion.div variants={heroScale} className="flex flex-col items-center">
            <PodiumPhoto
              entry={second}
              size="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40"
              ringColor="ring-silver"
              ringWidth="ring-2"
              badgeColor="bg-silver text-surface-1"
            />
          </motion.div>
        )}
        {first && (
          <motion.div variants={heroScale} className="flex flex-col items-center">
            <PodiumPhoto
              entry={first}
              size="w-20 h-20 md:w-44 md:h-44 lg:w-52 lg:h-52"
              ringColor="ring-gold"
              ringWidth="ring-4"
              glow="rgba(234,179,8,0.2)"
              badgeColor="bg-gold text-surface-1"
            />
          </motion.div>
        )}
        {third && (
          <motion.div variants={heroScale} className="flex flex-col items-center">
            <PodiumPhoto
              entry={third}
              size="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40"
              ringColor="ring-bronze"
              ringWidth="ring-2"
              badgeColor="bg-bronze text-surface-1"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Podium Photo ─── */

function PodiumPhoto({
  entry,
  size,
  ringColor,
  ringWidth,
  glow,
  badgeColor,
}: {
  entry: PodiumEntry
  size: string
  ringColor: string
  ringWidth: string
  glow?: string
  badgeColor: string
}) {
  const [photoError, setPhotoError] = useState(false)
  const photoSrc = `/Players/${entry.player.id}.png`

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Photo circle */}
      <div className="relative">
        {glow && (
          <div
            className="absolute inset-[-12px] rounded-full blur-2xl"
            style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
          />
        )}
        <div
          className={`relative ${size} rounded-full ${ringWidth} ${ringColor} overflow-hidden bg-surface-3 flex items-center justify-center`}
        >
          {!photoError ? (
            <img
              src={photoSrc}
              alt={entry.player.name}
              className="w-full h-full object-cover"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <span className="text-4xl md:text-5xl">🐵</span>
          )}
        </div>
        {/* Position badge */}
        <div
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${badgeColor} text-xs font-bold px-2 py-0.5 rounded-full shadow-lg`}
        >
          {entry.position}°
        </div>
      </div>
      {/* Name */}
      <span className="text-sm font-medium text-text-secondary max-w-[100px] truncate text-center">
        {entry.player.name}
      </span>
    </div>
  )
}

/* ─── Floating Poker Suit Decorations ─── */

const SUIT_PATHS = [
  // Spade
  'M8 2C8 2 3 7 3 10c0 2.5 2 4 5 4s5-1.5 5-4C13 7 8 2 8 2zM7 14h2v2H7v-2z',
  // Heart
  'M8 4C5.5 1 1 2.5 1 6.5c0 3 3 5.5 7 9.5 4-4 7-6.5 7-9.5C15 2.5 10.5 1 8 4z',
  // Diamond
  'M8 1L14 8l-6 7L2 8z',
  // Club
  'M8 2a3 3 0 100 6 3 3 0 000-6zM3 8a3 3 0 106 0H5a3 3 0 10-2 0zm8 0a3 3 0 106 0h-4a3 3 0 10-2 0zM7 14h2v2H7v-2z',
]

const FLOAT_POSITIONS = [
  { left: '8%', top: '15%', size: 100, delay: 0, opacity: 0.04 },
  { left: '85%', top: '20%', size: 80, delay: 2, opacity: 0.03 },
  { left: '15%', top: '70%', size: 120, delay: 4, opacity: 0.04 },
  { left: '78%', top: '75%', size: 90, delay: 1, opacity: 0.03 },
  { left: '50%', top: '10%', size: 70, delay: 3, opacity: 0.03 },
]

function FloatingDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {FLOAT_POSITIONS.map((pos, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 16 16"
          fill="currentColor"
          className="absolute text-text-primary"
          style={{
            left: pos.left,
            top: pos.top,
            width: pos.size,
            height: pos.size,
            opacity: pos.opacity,
          }}
          variants={floatSlow}
          animate="animate"
          transition={{
            delay: pos.delay,
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path d={SUIT_PATHS[i % SUIT_PATHS.length]} />
        </motion.svg>
      ))}
    </div>
  )
}
