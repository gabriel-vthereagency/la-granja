import type { LivePlayer } from '@lagranja/types'

interface SidePanelProps {
  type: 'eliminados' | 'recompras'
  players: LivePlayer[]
}

const MAX_VISIBLE_ELIMINADOS = 7
const RECOMPRAS_SCROLL_THRESHOLD = 5

export function SidePanel({ type, players }: SidePanelProps) {
  const label = type === 'eliminados' ? 'ELIMINADOS' : 'RECOMPRAS'

  // For eliminados: show eliminated players sorted by position (lowest first = latest elimination)
  // For recompras: show players with hasRebuy=true
  const allPlayers =
    type === 'eliminados'
      ? players
          .filter((p) => p.status === 'eliminated' && p.position !== null)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      : players.filter((p) => p.hasRebuy)

  // For eliminados: limit to N most recent (oldest disappear)
  const displayPlayers =
    type === 'eliminados' ? allPlayers.slice(0, MAX_VISIBLE_ELIMINADOS) : allPlayers

  // For recompras: enable scroll animation when > threshold
  const needsScroll = type === 'recompras' && displayPlayers.length > RECOMPRAS_SCROLL_THRESHOLD
  const scrollClass = needsScroll ? 'scroll-active' : ''

  const renderPlayerItem = (player: LivePlayer, index: number, keyPrefix = '') => (
    <div key={`${keyPrefix}${player.playerId || index}`} className="side-panel-item">
      <span className="player-icon">{type === 'eliminados' ? '💀' : '🐒'}</span>
      <span className="player-name">{player.name}</span>
      {type === 'eliminados' && player.position !== null && (
        <span className="player-position">(#{player.position})</span>
      )}
    </div>
  )

  return (
    <div className={`side-panel ${type}`}>
      <div className="side-panel-header">
        <span className="side-panel-label">{label}</span>
      </div>
      <div className={`side-panel-list ${scrollClass}`}>
        {displayPlayers.length === 0 ? (
          <div className="side-panel-empty">
            {type === 'eliminados' ? 'Sin eliminados' : 'Sin recompras'}
          </div>
        ) : (
          <div className="side-panel-scroll">
            {displayPlayers.map((player, index) => renderPlayerItem(player, index))}
            {/* Duplicate list for infinite scroll effect */}
            {needsScroll &&
              displayPlayers.map((player, index) => renderPlayerItem(player, index, 'dup-'))}
          </div>
        )}
      </div>
    </div>
  )
}
