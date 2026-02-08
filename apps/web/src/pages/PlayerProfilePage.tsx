import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlayerProfile } from '../hooks/usePlayerProfile'
import { formatPoints } from '../utils/formatPoints'
import { GlassCard, AnimatedCounter, PageHeader, CardSkeleton, PageContainer } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'

export function PlayerProfilePage() {
  const { playerId } = useParams()
  const { profile, loading, error } = usePlayerProfile(playerId)

  if (loading) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Cargando..." backTo="/jugadores" backLabel="Volver a jugadores" />
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-surface-3/60 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-surface-3/60 animate-pulse" />
            <div className="h-4 w-24 rounded bg-surface-3/60 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
      </PageContainer>
    )
  }

  if (error || !profile) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <PageHeader title="Error" backTo="/jugadores" backLabel="Volver a jugadores" />
        <GlassCard className="p-8 text-center text-accent-light">
          {error ?? 'Jugador no encontrado'}
        </GlassCard>
      </div>
      </PageContainer>
    )
  }

  const { player, aliases, favoriteHand, memberSince, stats } = profile

  return (
    <PageContainer>
    <div className="space-y-6">
      <PageHeader title={player.name} backTo="/jugadores" backLabel="Volver a jugadores" />

      {/* Header del perfil */}
      <motion.div variants={fadeIn} initial="initial" animate="animate">
        <GlassCard className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-surface-3 rounded-full flex items-center justify-center text-5xl shrink-0 ring-2 ring-glass-border">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              '🐵'
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight">{player.name}</h1>
            {player.nickname && (
              <p className="text-text-secondary">"{player.nickname}"</p>
            )}
            {aliases.length > 0 && (
              <p className="text-text-tertiary text-sm">
                Aliases: {aliases.join(', ')}
              </p>
            )}
            {favoriteHand && (
              <p className="text-text-tertiary text-sm italic mt-2">
                Mano favorita: {favoriteHand}
              </p>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Badges HOF */}
      {stats.finalSevens > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="px-3 py-1 bg-accent-muted text-accent-light rounded-full text-sm font-medium">
            {stats.finalSevens}x Final Seven
          </span>
        </motion.div>
      )}

      {/* Stats principales */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-text-primary">
              {memberSince ? formatDate(memberSince) : '-'}
            </div>
            <div className="text-text-tertiary text-sm">Miembro desde</div>
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <AnimatedCounter
              value={stats.totalEvents}
              className="text-2xl font-bold text-text-primary"
            />
            <div className="text-text-tertiary text-sm">Fechas jugadas</div>
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <AnimatedCounter
              value={stats.totalPoints}
              format={(v) => formatPoints(Math.round(v))}
              className="text-2xl font-bold text-success"
            />
            <div className="text-text-tertiary text-sm">Puntos totales</div>
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <AnimatedCounter
              value={stats.effectiveness}
              format={(v) => v.toFixed(2)}
              className="text-2xl font-bold text-blue-400"
            />
            <div className="text-text-tertiary text-sm">Efectividad</div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Posiciones */}
      <motion.div variants={fadeIn} initial="initial" animate="animate">
        <h2 className="text-lg font-medium mb-3 text-text-secondary">Posiciones</h2>
        <motion.div
          className="grid grid-cols-3 md:grid-cols-6 gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            { label: '🥇 Oros', value: stats.golds, color: 'text-gold' },
            { label: '🥈 Platas', value: stats.silvers, color: 'text-silver' },
            { label: '🥉 Bronces', value: stats.bronzes, color: 'text-bronze' },
            { label: '4°', value: stats.fourths, color: 'text-text-secondary' },
            { label: '5°', value: stats.fifths, color: 'text-text-secondary' },
            { label: '6° Burbuja', value: stats.bubbles, color: 'text-text-tertiary' },
          ].map((s) => (
            <motion.div key={s.label} variants={staggerItem}>
              <GlassCard className="p-4 text-center">
                <AnimatedCounter value={s.value} className={`text-2xl font-bold ${s.color}`} />
                <div className="text-text-tertiary text-sm">{s.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Otros stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <AnimatedCounter value={stats.finalTables} className="text-2xl font-bold text-purple-400" />
            <div className="text-text-tertiary text-sm">Mesas finales</div>
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <AnimatedCounter value={stats.lastPlaces} className="text-2xl font-bold text-accent-light" />
            <div className="text-text-tertiary text-sm">Últimos puestos</div>
          </GlassCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <GlassCard className="p-4 text-center">
            <AnimatedCounter
              value={stats.golds + stats.silvers + stats.bronzes + stats.fourths + stats.fifths}
              className="text-2xl font-bold text-blue-400"
            />
            <div className="text-text-tertiary text-sm">Podios (top 5)</div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
    </PageContainer>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    month: 'short',
    year: 'numeric',
  })
}
