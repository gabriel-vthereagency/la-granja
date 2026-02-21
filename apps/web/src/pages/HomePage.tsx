import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSeasons } from '../hooks/useSeasons'
import { useStandings } from '../hooks/useStandings'
import { useLastPodium, type PodiumEntry } from '../hooks/useLastPodium'
import { StandingsTable } from '../components/StandingsTable'
import { LiveTournamentBanner } from '../components/LiveTournamentBanner'
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
      <section className="relative min-h-[100svh] pt-24 md:pt-28 flex flex-col overflow-hidden">
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6 md:pb-8">
            <motion.div
              className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4"
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
                  <div className="relative z-10 p-3 sm:p-4 md:p-6">
                    <h3 className="text-base md:text-xl font-bold text-gold mb-0.5 md:mb-1" style={{ fontFamily: 'var(--font-nav)' }}>
                      Hall of Fame
                    </h3>
                    <p className="hidden md:block text-text-secondary text-xs md:text-sm">
                      Los campeones de La Granja
                    </p>
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
                  <div className="relative z-10 p-3 sm:p-4 md:p-6">
                    <h3 className="text-base md:text-xl font-bold text-accent-light mb-0.5 md:mb-1" style={{ fontFamily: 'var(--font-nav)' }}>
                      Jugadores
                    </h3>
                    <p className="hidden md:block text-text-secondary text-xs md:text-sm">
                      Directorio y perfiles
                    </p>
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
      </section>

      {/* ═══ CONTENT — Constrained width ═══ */}
      <PageContainer>
        <div className="space-y-8">
          {/* Live tournament banner */}
          <LiveTournamentBanner />

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
              size="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40"
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
              size="w-24 h-24 md:w-44 md:h-44 lg:w-52 lg:h-52"
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
              size="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40"
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
              className="w-full h-full object-cover object-top"
              style={{ transform: 'scale(1.6)', transformOrigin: 'top center' }}
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

const SUIT_VIEWBOX = '0 0 1759 1759'
const SUIT_SHAPES = [
  // Spade
  {
    shapes: [
      {
        kind: 'path',
        data:
          'M575.6,1652.9c78.8-94.6,149.3-198.5,184.8-318-176.5,81.9-367.5,101.9-496-69.1-128.8-171.4-117.2-411.9,25.4-571.3L879.2,106.1l588.2,584.1c156.1,171.2,156.8,441.9-4.3,610.4-130.5,136.5-311.9,102.5-466.3,30.1,37.3,120.4,104.7,229.4,189.1,322.3h-610.2Z',
      },
    ],
  },
  // Club
  {
    shapes: [
      {
        kind: 'path',
        data:
          'M573,1657c92.1-101.8,169.4-222,198.4-358-184.5,148.4-473.5,89-570.1-130.8-116.6-265.3,127.5-539.2,401.9-481.7,3.1-3.6-34.6-53.2-39.5-61.8C396.9,334.9,693.9,20.1,1002.3,121.3c237.6,78,320.9,370,157.4,560.8,265.1-42.4,498.7,198.4,408.5,462.5-80.5,235.6-391.6,308.9-581,154.4,32.4,136.3,106.4,254.6,198.4,358h-612.5Z',
      },
    ],
  },
  // Diamond
  {
    shapes: [
      {
        kind: 'polygon',
        data: '879.1 97.2 1390 881.5 879.1 1661.8 369.3 881 879.1 97.2',
      },
    ],
  },
  // Heart
  {
    shapes: [
      {
        kind: 'path',
        data:
          'M482.4,131.7c178.2-18.2,296.4,67.7,398.6,202.8,76.1-96.3,174.8-189.2,304.1-199.8,420.1-34.3,581.7,528.6,312.3,799.6l-616.4,695.4L237.6,902.9C21.5,666.7,141,166.6,482.4,131.7Z',
      },
    ],
  },
  // Monkey (logo face)
  {
    shapes: [
      {
        kind: 'path',
        data:
          'M543.5,1266.4c2.1,38.9,26.6,104.7,53.3,136.7,58.8,70.5,152.7,107.8,279,111,114.3,2.9,210-24.1,214-25.2,3.4-1,7-1.9,10.6-3.5,127.7-54.4,194.2-157.6,176.2-233.7-122.3,42-252.3,77.5-376.7,79-156.2,1.9-287-40.7-356.3-64.3Z',
      },
      {
        kind: 'path',
        data:
          'M1322.4,583.4c-97-221.9-273.3-177.3-325-158.4-30.1,11-58.2,26.8-79,44.5l-12.8,10.8-12-11.7c-.2-.2-27.4-26.2-71-45.4-57.2-25.2-114.6-27.6-170.6-7-18.4,6.7-36.7,16.1-54.6,27.7-72.1,47-113,143.9-106.8,252.7,6,103.4,60,237.7,193.9,304.5l24.1,12-19.9,18.2c-1,.9-108.5,101.8-140.9,203.9,96.7,34,392.4,106.4,725.4-13.9-14.4-57.2-58.4-134-117.4-193.2l-16.2-16.3,19.4-12.4c.7-.4,69.3-44.8,123.3-118.8,70.6-96.8,84.1-196.9,40.2-297.3Z',
      },
      {
        kind: 'path',
        data:
          'M1018.2,78.9l75.3,163.9c20.2,7.3,76,29.7,137.3,73.7,100.5,72,167.2,168,193,277.5,29-2.5,92-2.4,146,36.7,47,34.1,75.5,88.9,84.7,163,18.3,147.5-68.7,248.4-163.1,283,0,0,0,0,0,0-61.3,22.5-124.2,18.5-175.6-10.5-.4.5-.7,1-1.1,1.5,54,112.7,63.8,214.2,29.1,301.8-18,45.3-47.6,85.6-88.2,119.9-37.2,31.5-82.7,57.2-135.2,76.4-149.9,54.9-337.7,48.8-467.5-15.2-156.9-77.4-191.2-207.7-192.4-303.4-.8-71,15.8-132.6,26.4-164.7-6.3,3.1-12.7,5.9-19.3,8.3-69.2,25.4-152,10.3-216.1-39.4-71.6-55.5-107-142.9-97.3-239.9,12.4-123.6,77.7-172.6,130.4-191.9,37.3-13.7,72.9-14.5,93.5-13.4,22-95.4,76.9-184.8,159.6-259.5,56.2-50.8,107.9-79.4,123.3-87.4l-63.3-51.6-60-47.8,76.4,16.8.5-1,13.9,4.1h0s199.8,59.2,199.8,59.2l-63.8-132.4,227.4,145.9,24.7-173.9c-36.6-5.1-73.9-7.7-111.9-7.7-446.3,0-808.1,361.8-808.1,808.1s361.8,808.1,808.1,808.1,808.1-361.8,808.1-808.1S1410.7,134.1,1018.2,78.9Z',
      },
      {
        kind: 'path',
        data:
          'M1453.8,986.8c50.9-18.7,86.9-75,87.5-137,.4-43.5-18.9-75.5-57.5-95.3-17.2-8.8-34.9-13.5-47.7-15.9-5.6,95.9-36.8,178.8-65.2,236,24.5,18.6,53.6,23,83,12.2Z',
      },
      {
        kind: 'path',
        data:
          'M345.1,758.7c-52.5,19.3-78.3,55-76.6,106.3,1.7,49.5,26.2,96,64.1,121.5,27.5,18.5,57.5,23.3,84.3,13.5,9.1-3.3,17.7-8.3,25.7-14.8-41.8-80.2-66.5-158.6-73.6-233.4-7,1.6-15.2,3.8-23.9,7Z',
      },
      {
        kind: 'path',
        data:
          'M442.6,985.1c-8.1,6.5-16.7,11.5-25.7,14.8-26.9,9.8-56.8,5.1-84.3-13.5-37.8-25.5-62.4-72.1-64.1-121.5-1.7-51.2,24-87,76.6-106.3,8.7-3.2,16.9-5.4,23.9-7,7.1,74.9,31.8,153.2,73.6,233.4Z',
      },
    ],
  },
] as const

const FLOAT_POSITIONS = [
  { left: '8%', top: '15%', size: 100, delay: 0, opacity: 0.04 },
  { left: '85%', top: '20%', size: 80, delay: 2, opacity: 0.03 },
  { left: '15%', top: '70%', size: 120, delay: 4, opacity: 0.04 },
  { left: '78%', top: '75%', size: 90, delay: 1, opacity: 0.03 },
  { left: '50%', top: '10%', size: 70, delay: 3, opacity: 0.03 },
  { left: '38%', top: '58%', size: 160, delay: 1.5, opacity: 0.03, shapeIndex: 4 },
]

function FloatingDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {FLOAT_POSITIONS.map((pos, i) => {
        const shapeIndex = pos.shapeIndex ?? i % SUIT_SHAPES.length
        const icon = SUIT_SHAPES[shapeIndex] ?? SUIT_SHAPES[0]
        return (
        <motion.svg
          key={i}
          viewBox={SUIT_VIEWBOX}
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
          {icon.shapes.map((shape, idx) =>
            shape.kind === 'path' ? (
              <path key={idx} d={shape.data} />
            ) : (
              <polygon key={idx} points={shape.data} />
            )
          )}
        </motion.svg>
      )})}
    </div>
  )
}
