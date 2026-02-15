import type { LivePlayer } from '@lagranja/types'
import logoImg from '/logo.png'
import laurelesImg from '/laureles.png'
import monkeyImg from '/Monkey-Selfie.webp'

interface ChampionModalProps {
  championName: string
  players: LivePlayer[]
}

function getPlayerPhoto(player: LivePlayer | undefined): string {
  if (!player) return monkeyImg
  return `/Players/${player.playerId}.png`
}

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  if (img.dataset.fallback) return // Prevent infinite loop
  img.dataset.fallback = '1'
  img.src = monkeyImg
}

export function ChampionModal({ championName, players }: ChampionModalProps) {
  const sortedPlayers = [...players]
    .filter((p) => p.position !== null)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  const hasChampion = sortedPlayers.some((p) => p.position === 1)
  if (!hasChampion) {
    const championPlayer = players.find((p) => p.name === championName)
    if (championPlayer) {
      sortedPlayers.unshift({ ...championPlayer, position: 1 })
    }
  }

  const top1 = sortedPlayers.find((p) => p.position === 1)
  const top2 = sortedPlayers.find((p) => p.position === 2)
  const top3 = sortedPlayers.find((p) => p.position === 3)

  return (
    <div className="champion-overlay">
      <div className="champion-screen">
        <div className="champion-cards">
          <div className="champion-card champion-card-secondary">
            <div className="champion-avatar">
              <img
                src={getPlayerPhoto(top2)}
                alt={top2?.name ?? 'Jugador'}
                onError={handleImgError}
              />
            </div>
            <div className="champion-rank">#2</div>
            <div className="champion-name">{top2?.name ?? '-'}</div>
          </div>

          <div className="champion-card champion-card-main">
            <div className="champion-avatar champion-avatar-main">
              <img
                src={getPlayerPhoto(top1)}
                alt={top1?.name ?? 'Campeon'}
                onError={handleImgError}
              />
            </div>
            <div className="champion-badge">
              <img src={laurelesImg} alt="Laureles" />
              <span className="champion-rank">#1</span>
            </div>
            <div className="champion-title">Campeon</div>
            <div className="champion-name">{top1?.name ?? championName}</div>
          </div>

          <div className="champion-card champion-card-tertiary">
            <div className="champion-avatar">
              <img
                src={getPlayerPhoto(top3)}
                alt={top3?.name ?? 'Jugador'}
                onError={handleImgError}
              />
            </div>
            <div className="champion-rank">#3</div>
            <div className="champion-name">{top3?.name ?? '-'}</div>
          </div>
        </div>

        <div className="champion-footer">
          <img src={logoImg} alt="La Granja Poker Club" />
        </div>
      </div>
    </div>
  )
}
