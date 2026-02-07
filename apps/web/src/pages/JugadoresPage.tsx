import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlayers } from '../hooks/usePlayers'
import { GlassCard, CardSkeleton, PageHeader } from '../components/ui'
import { staggerContainer, staggerItem } from '../lib/motion'

export function JugadoresPage() {
  const { players, loading, error } = usePlayers()
  const [search, setSearch] = useState('')

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nickname?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Jugadores" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Jugadores" />
        <GlassCard className="p-8 text-center text-accent-light">Error: {error}</GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Jugadores" />

      {/* Buscador */}
      <div>
        <input
          type="text"
          placeholder="Buscar por nombre o alias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 bg-glass border border-glass-border rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
        />
      </div>

      {/* Contador */}
      <p className="text-text-tertiary text-sm">
        {filtered.length} jugador{filtered.length !== 1 ? 'es' : ''}
        {search && ` encontrado${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Grid de jugadores */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        key={search}
      >
        {filtered.map((player) => (
          <motion.div key={player.id} variants={staggerItem}>
            <GlassCard hoverable>
              <Link
                to={`/jugadores/${player.id}`}
                className="flex items-center gap-4 p-4"
              >
                <div className="w-12 h-12 bg-surface-3 rounded-full flex items-center justify-center text-2xl shrink-0">
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
                <div>
                  <div className="font-medium">{player.name}</div>
                  {player.nickname && (
                    <div className="text-text-tertiary text-sm">"{player.nickname}"</div>
                  )}
                </div>
              </Link>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <GlassCard className="p-8 text-center text-text-secondary">
          No se encontraron jugadores
        </GlassCard>
      )}
    </div>
  )
}
