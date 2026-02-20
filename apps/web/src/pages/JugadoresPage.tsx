import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayers, type PlayerCard } from '../hooks/usePlayers'
import { useCompareState } from '../hooks/useCompareState'
import { GlassCard, PageHeader, PageContainer } from '../components/ui'
import { CompareBar } from '../components/compare/CompareBar'
import { ComparePanel } from '../components/compare/ComparePanel'
import { staggerContainer, staggerItem } from '../lib/motion'

function getBadgeSrc(titles: number): string {
  if (titles >= 3) return '/trifoh.png'
  if (titles === 2) return '/bihof.png'
  if (titles === 1) return '/hof.png'
  return '/mono.png'
}

const MONO_FALLBACKS: [string, string, string] = ['/Players/mono1.png', '/Players/mono2.png', '/Players/mono-3.png']

function getFallbackSrc(playerId: string): string {
  let hash = 0
  for (let i = 0; i < playerId.length; i += 1) {
    hash = (hash * 31 + playerId.charCodeAt(i)) >>> 0
  }
  const pick = MONO_FALLBACKS[hash % MONO_FALLBACKS.length] ?? MONO_FALLBACKS[0]
  return pick
}

export function JugadoresPage() {
  const { players, loading, error } = usePlayers()
  const [search, setSearch] = useState('')
  const compare = useCompareState()

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nickname?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedPlayers = compare.selectedIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is PlayerCard => p != null)

  if (loading) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Jugadores" />
        {/* Desktop skeleton */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-3/60 animate-pulse h-[420px]" />
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-3/60 animate-pulse h-[110px]" />
          ))}
        </div>
      </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Jugadores" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
    <div className="space-y-6">
      <PageHeader title="Jugadores" />

      {/* Search + Compare toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o alias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:flex-1 md:max-w-96 px-4 py-2.5 bg-glass border border-glass-border rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
        />
        <button
          onClick={compare.toggleCompareMode}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 justify-center ${
            compare.compareMode
              ? 'bg-accent text-white shadow-[0_0_20px_rgba(239,68,68,0.25)]'
              : 'bg-glass border border-glass-border text-text-secondary hover:text-text-primary hover:border-accent/40'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h5M9 4h5M2 8h5M9 8h5M2 12h5M9 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {compare.compareMode ? 'Comparando...' : 'Comparar'}
        </button>
      </div>

      {/* Counter */}
      <p className="text-text-tertiary text-sm">
        {filtered.length} jugador{filtered.length !== 1 ? 'es' : ''}
        {search && ` encontrado${filtered.length !== 1 ? 's' : ''}`}
        {compare.compareMode && (
          <span className="ml-2 text-accent-light">
            — Selecciona jugadores para comparar
          </span>
        )}
      </p>

      {/* Desktop: Trading Cards */}
      <motion.div
        className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        key={`desktop-${search}`}
      >
        {filtered.map((player) => (
          <motion.div key={player.id} variants={staggerItem}>
            <DesktopCard
              player={player}
              compareMode={compare.compareMode}
              isSelected={compare.isSelected(player.id)}
              isFull={compare.isFull}
              onSelect={() => compare.selectPlayer(player.id)}
              onDeselect={() => compare.deselectPlayer(player.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile: Compact horizontal cards */}
      <motion.div
        className="md:hidden space-y-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        key={`mobile-${search}`}
      >
        {filtered.map((player) => (
          <motion.div key={player.id} variants={staggerItem}>
            <MobileCard
              player={player}
              compareMode={compare.compareMode}
              isSelected={compare.isSelected(player.id)}
              isFull={compare.isFull}
              onSelect={() => compare.selectPlayer(player.id)}
              onDeselect={() => compare.deselectPlayer(player.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <GlassCard className="p-8 text-center text-text-secondary">
          No se encontraron jugadores
        </GlassCard>
      )}

      {/* Extra bottom padding when CompareBar is visible */}
      {compare.compareMode && <div className="h-24" />}
    </div>

    {/* Compare Bar */}
    <AnimatePresence>
      {compare.compareMode && !compare.isFullView && (
        <CompareBar
          selectedPlayers={selectedPlayers}
          onDeselect={compare.deselectPlayer}
          onCompare={compare.openFullView}
          onExit={compare.exitCompareMode}
        />
      )}
    </AnimatePresence>

    {/* Compare Panel (full overlay) */}
    <AnimatePresence>
      {compare.isFullView && (
        <ComparePanel
          selectedIds={compare.selectedIds}
          onClose={compare.closeFullView}
        />
      )}
    </AnimatePresence>
    </PageContainer>
  )
}

interface CardCompareProps {
  player: PlayerCard
  compareMode: boolean
  isSelected: boolean
  isFull: boolean
  onSelect: () => void
  onDeselect: () => void
}

function DesktopCard({ player, compareMode, isSelected, isFull, onSelect, onDeselect }: CardCompareProps) {
  const [photoState, setPhotoState] = useState<'primary' | 'fallback' | 'emoji'>('primary')
  const photoSrc = `/Players/${player.id}.png`
  const fallbackSrc = getFallbackSrc(player.id)
  const badgeSrc = getBadgeSrc(player.finalSevenTitles)

  const disabled = compareMode && !isSelected && isFull

  const handleClick = (e: React.MouseEvent) => {
    if (!compareMode) return // Let the Link navigate
    e.preventDefault()
    if (isSelected) {
      onDeselect()
    } else if (!isFull) {
      onSelect()
    }
  }

  return (
    <Link
      to={`/jugadores/${player.id}`}
      onClick={handleClick}
      className={`group relative block rounded-xl overflow-hidden border transition-all duration-300 h-[420px] ${
        isSelected
          ? 'border-accent ring-2 ring-accent/40'
          : disabled
            ? 'border-glass-border opacity-40 cursor-not-allowed'
            : 'border-glass-border hover:border-accent/40'
      }`}
    >
      {/* Red radial gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-surface-2/80 to-surface-1" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(239,68,68,0.12)_0%,transparent_70%)]" />

      {/* Badge — top-left corner */}
      <img
        src={badgeSrc}
        alt=""
        className="absolute top-3 left-3 w-14 h-14 object-contain z-10 drop-shadow-lg"
      />

      {/* Top-right: compare checkbox or clickable hint */}
      <div className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
        isSelected
          ? 'bg-accent text-white border border-accent'
          : compareMode
            ? 'bg-glass/80 border border-glass-border text-text-tertiary group-hover:border-accent/50 group-hover:text-accent-light'
            : 'bg-glass/80 border border-glass-border text-text-tertiary group-hover:border-accent/50 group-hover:text-accent-light'
      }`}>
        {isSelected ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Player photo */}
      <div className="absolute inset-0 flex items-end justify-center pb-[90px]">
        {photoState === 'primary' ? (
          <img
            src={photoSrc}
            alt={player.name}
            loading="lazy"
            className="h-[90%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setPhotoState('fallback')}
          />
        ) : photoState === 'fallback' ? (
          <img
            src={fallbackSrc}
            alt=""
            loading="lazy"
            className="h-[90%] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300 opacity-90"
            onError={() => setPhotoState('emoji')}
          />
        ) : (
          <span className="text-8xl opacity-30 mb-8">🐵</span>
        )}
      </div>

      {/* Glass info panel at bottom — floating with rounded corners */}
      <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] p-3 pt-5 text-center space-y-1.5 overflow-hidden">
        {/* Glow effect behind content */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.12)_0%,transparent_60%)]" />
        {/* Name with gradient pill */}
        <div className="relative inline-flex items-center justify-center px-5 py-1 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border border-white/[0.1] shadow-[0_0_20px_rgba(255,255,255,0.06)]">
          <h3 className="text-lg font-bold text-text-primary tracking-tight">{player.name}</h3>
        </div>
        {player.memberSince && (
          <p className="relative text-text-tertiary text-xs">Miembro desde {player.memberSince}</p>
        )}
        <div className="relative flex items-center justify-center gap-3 text-sm">
          <span className="text-gold font-medium">🥇 {player.golds}</span>
          <span className="text-silver font-medium">🥈 {player.silvers}</span>
          <span className="text-bronze font-medium">🥉 {player.bronzes}</span>
        </div>
      </div>
    </Link>
  )
}

function MobileCard({ player, compareMode, isSelected, isFull, onSelect, onDeselect }: CardCompareProps) {
  const [photoState, setPhotoState] = useState<'primary' | 'fallback' | 'emoji'>('primary')
  const photoSrc = `/Players/${player.id}.png`
  const fallbackSrc = getFallbackSrc(player.id)
  const badgeSrc = getBadgeSrc(player.finalSevenTitles)

  const disabled = compareMode && !isSelected && isFull

  const handleClick = (e: React.MouseEvent) => {
    if (!compareMode) return
    e.preventDefault()
    if (isSelected) {
      onDeselect()
    } else if (!isFull) {
      onSelect()
    }
  }

  return (
    <Link
      to={`/jugadores/${player.id}`}
      onClick={handleClick}
      className={`group relative block rounded-xl overflow-hidden border transition-all duration-300 h-[110px] ${
        isSelected
          ? 'border-accent ring-2 ring-accent/40'
          : disabled
            ? 'border-glass-border opacity-40 cursor-not-allowed'
            : 'border-glass-border hover:border-accent/40'
      }`}
    >
      {/* Red gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-surface-2/80 to-surface-1" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(239,68,68,0.10)_0%,transparent_60%)]" />

      {/* Selection indicator — top-left */}
      {compareMode && (
        <div className={`absolute top-2 left-2 z-20 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
          isSelected
            ? 'bg-accent text-white border border-accent'
            : 'bg-glass/80 border border-glass-border'
        }`}>
          {isSelected && (
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}

      {/* Left info column */}
      <div className={`absolute ${compareMode ? 'left-9' : 'left-3'} top-2.5 bottom-2.5 right-28 z-10 flex flex-col justify-between transition-all`}>
        {/* Name pill + member since — top */}
        <div>
          <div className="inline-flex self-start items-center px-3 py-0.5 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border border-white/[0.1]">
            <span className="font-bold text-text-primary text-sm truncate">{player.name}</span>
          </div>
          {player.memberSince && (
            <div className="text-text-tertiary text-[11px] mt-1 ml-1">Desde {player.memberSince}</div>
          )}
        </div>
        {/* Medals — bottom */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gold font-medium">🥇 {player.golds}</span>
          <span className="text-silver font-medium">🥈 {player.silvers}</span>
          <span className="text-bronze font-medium">🥉 {player.bronzes}</span>
        </div>
      </div>

      {/* Badge — center of card */}
      <img
        src={badgeSrc}
        alt=""
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 object-contain z-10 drop-shadow-lg opacity-60"
      />

      {/* Player photo — right side, showing head down */}
      <div className="absolute right-0 top-0 bottom-0 w-28 overflow-hidden">
        {photoState === 'primary' ? (
          <img
            src={photoSrc}
            alt=""
            loading="lazy"
            className="absolute top-[-15%] right-0 h-[160%] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            onError={() => setPhotoState('fallback')}
          />
        ) : photoState === 'fallback' ? (
          <img
            src={fallbackSrc}
            alt=""
            loading="lazy"
            className="absolute top-[-15%] right-0 h-[160%] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] opacity-90"
            onError={() => setPhotoState('emoji')}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-30">🐵</span>
          </div>
        )}
      </div>
    </Link>
  )
}
