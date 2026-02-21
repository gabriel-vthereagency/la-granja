import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStats, type StatsData, type StatsRow } from '../hooks/useStats'
import { useSeasons } from '../hooks/useSeasons'
import { formatPoints } from '../utils/formatPoints'
import { GlassCard, CardSkeleton, PageHeader, PageContainer } from '../components/ui'
import { staggerFast, tableRow } from '../lib/motion'

interface StatCategory {
  id: string
  label: string
  shortLabel: string
  image: string
  dataKey: keyof StatsData
  formatValue?: (v: number) => string
  valueLabel: string
}

const STAT_CATEGORIES: StatCategory[] = [
  {
    id: 'wins',
    label: 'Top Victorias (1°)',
    shortLabel: 'Victorias',
    image: '/top%20victorias.png',
    dataKey: 'topWins',
    valueLabel: 'Cantidad',
  },
  {
    id: 'podiums',
    label: 'Top Podios (Top 5)',
    shortLabel: 'Podios',
    image: '/top%20podios.png',
    dataKey: 'topPodiums',
    valueLabel: 'Cantidad',
  },
  {
    id: 'presences',
    label: 'Top Presencias',
    shortLabel: 'Presencias',
    image: '/Top%20presencias.png',
    dataKey: 'topPresences',
    valueLabel: 'Cantidad',
  },
  {
    id: 'effectiveness',
    label: 'Efectividad (Pts)',
    shortLabel: 'Pts/Fecha',
    image: '/efectividad%20puntos.png',
    dataKey: 'topEffectiveness',
    formatValue: (v: number) => formatPoints(v),
    valueLabel: 'Pts/Fecha',
  },
  {
    id: 'win-rate',
    label: 'Efectividad (Oros)',
    shortLabel: 'Oros/Fecha',
    image: '/efectividad%20oros.png',
    dataKey: 'topWinRate',
    formatValue: (v: number) => `${v.toFixed(1)}%`,
    valueLabel: '% Victorias',
  },
  {
    id: 'last-places',
    label: 'Top Últimos Puestos',
    shortLabel: 'Últimos',
    image: '/Top%20ultimos.png',
    dataKey: 'topLastPlaces',
    valueLabel: 'Cantidad',
  },
  {
    id: 'bubbles',
    label: 'Top Burbujas (6°)',
    shortLabel: 'Burbujas',
    image: '/top%20burbujas.png',
    dataKey: 'topBubbles',
    valueLabel: 'Cantidad',
  },
  {
    id: 'rebuys',
    label: 'Top Rebuys',
    shortLabel: 'Rebuys',
    image: '/top%20rebuys.png',
    dataKey: 'topRebuys',
    valueLabel: 'Cantidad',
  },
  {
    id: 'bounties',
    label: 'Top Bounties',
    shortLabel: 'Bounties',
    image: '/top%20bounties.png',
    dataKey: 'topBounties',
    valueLabel: 'Cantidad',
  },
]

export function EstadisticasPage() {
  const [seasonId, setSeasonId] = useState<string | null>(null)
  const { stats, loading, error } = useStats(seasonId)
  const { seasons } = useSeasons()
  const [activeId, setActiveId] = useState('wins')

  const activeCategory = STAT_CATEGORIES.find((c) => c.id === activeId)!
  const activeData = stats[activeCategory.dataKey]

  if (loading) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Estadísticas" />
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2 md:gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-[140px] rounded-xl bg-surface-3/60 animate-pulse" />
          ))}
        </div>
        <div className="max-w-2xl mx-auto">
          <CardSkeleton className="h-64" />
        </div>
      </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Estadísticas" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
    <div className="space-y-6">
      <PageHeader title="Estadísticas" />

      {/* Season selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mb-2">
        <button
          onClick={() => setSeasonId(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            seasonId === null
              ? 'bg-accent text-white shadow-[0_0_12px_rgba(239,68,68,0.2)]'
              : 'bg-glass border border-glass-border text-text-secondary hover:text-text-primary hover:border-accent/30'
          }`}
        >
          Histórico
        </button>
        {seasons
          .filter((s) => s.status === 'active' || s.status === 'finished')
          .map((s) => (
          <button
            key={s.id}
            onClick={() => setSeasonId(s.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              seasonId === s.id
                ? 'bg-accent text-white shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-glass border border-glass-border text-text-secondary hover:text-text-primary hover:border-accent/30'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <StatCardSelector
        categories={STAT_CATEGORIES}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <StatsTable
            title={activeCategory.label}
            data={activeData}
            formatValue={activeCategory.formatValue}
            valueLabel={activeCategory.valueLabel}
          />
        </motion.div>
      </AnimatePresence>
    </div>
    </PageContainer>
  )
}

function StatCardSelector({
  categories,
  activeId,
  onSelect,
}: {
  categories: StatCategory[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSelect = (id: string) => {
    onSelect(id)
    const button = scrollRef.current?.querySelector(`[data-stat-id="${id}"]`) as HTMLElement | null
    button?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-3 overflow-x-auto py-3 px-1 snap-x snap-mandatory md:justify-center"
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeId
          return (
            <button
              key={cat.id}
              type="button"
              data-stat-id={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`
                relative flex-shrink-0 flex flex-col items-center justify-center gap-2.5
                w-[110px] md:w-[130px] p-4 md:p-5 rounded-xl cursor-pointer
                border transition-all duration-200 snap-center
                ${isActive
                  ? 'border-accent/60 bg-accent-muted scale-105'
                  : 'border-glass-border bg-glass hover:bg-glass-hover hover:border-accent/30'
                }
              `}
              style={isActive ? { boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' } : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="stat-indicator"
                  className="absolute inset-0 rounded-xl border-2 border-accent/50"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <img
                src={cat.image}
                alt={cat.shortLabel}
                className={`w-16 h-16 md:w-[72px] md:h-[72px] object-contain transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-60'
                }`}
              />
              <span className={`relative z-10 text-sm md:text-base font-semibold tracking-tight text-center leading-tight transition-colors ${
                isActive ? 'text-text-primary' : 'text-text-tertiary'
              }`}>
                {cat.shortLabel}
              </span>
            </button>
          )
        })}
      </div>
      {/* Mobile fade hint: more cards to the right */}
      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-surface-1 to-transparent pointer-events-none md:hidden" />
    </div>
  )
}

function StatsTable({
  title,
  data,
  formatValue,
  valueLabel = 'Cantidad',
}: {
  title: string
  data: StatsRow[]
  formatValue?: (value: number) => string
  valueLabel?: string
}) {
  return (
    <div className="bg-glass border border-glass-border rounded-xl overflow-hidden">
      <h2 className="px-5 py-3 bg-surface-2/80 backdrop-blur-sm text-lg font-semibold text-text-primary">{title}</h2>
      <table className="w-full">
        <thead>
          <tr className="text-sm text-text-tertiary">
            <th className="px-5 py-2.5 text-left w-12">#</th>
            <th className="px-5 py-2.5 text-left">Jugador</th>
            <th className="px-5 py-2.5 text-right">{valueLabel}</th>
          </tr>
        </thead>
        <motion.tbody variants={staggerFast} initial="initial" animate="animate">
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-4 text-center text-text-tertiary">
                Sin datos
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const isFirst = row.rank === 1
              return (
                <motion.tr
                  key={`${row.rank}-${row.player}`}
                  variants={tableRow}
                  className={`border-t border-glass-border hover:bg-glass-hover transition ${
                    isFirst ? 'bg-accent-muted/30' : ''
                  }`}
                >
                  <td className={`px-5 py-2.5 ${isFirst ? 'text-accent font-bold text-lg' : 'text-text-tertiary'}`}>
                    {row.rank}
                  </td>
                  <td className={`px-5 py-2.5 ${isFirst ? 'text-text-primary font-semibold text-base' : ''}`}>
                    {row.playerId ? (
                      <Link
                        to={`/jugadores/${row.playerId}`}
                        className="hover:text-accent-light transition-colors"
                      >
                        {row.player}
                      </Link>
                    ) : (
                      row.player
                    )}
                  </td>
                  <td className={`px-5 py-2.5 text-right ${
                    isFirst ? 'text-gold font-bold text-lg' : 'text-success'
                  }`}>
                    {formatValue ? formatValue(row.value) : row.value}
                  </td>
                </motion.tr>
              )
            })
          )}
        </motion.tbody>
      </table>
    </div>
  )
}
