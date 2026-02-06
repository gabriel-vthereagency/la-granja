import { formatCurrency, type PrizePoolBreakdown } from '@lagranja/core'

interface PrizesRowProps {
  prizeBreakdown: PrizePoolBreakdown
}

export function PrizesRow({ prizeBreakdown }: PrizesRowProps) {
  const prizes = prizeBreakdown.prizes.slice(0, 4)

  return (
    <div className="bottom-row">
      {/* Pozo */}
      <div className="stat-card prize-pool">
        <div className="stat-label">Pozo</div>
        <div className="stat-value prize-value">{formatCurrency(prizeBreakdown.netPool)}</div>
      </div>

      {/* 1° */}
      {prizes[0] && (
        <div className="stat-card">
          <div className="stat-label prize-position pos-1">1°</div>
          <div className="stat-value">{formatCurrency(prizes[0].amount)}</div>
        </div>
      )}

      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="La Granja Poker Club" className="club-logo" />
      </div>

      {/* 2° */}
      {prizes[1] && (
        <div className="stat-card">
          <div className="stat-label prize-position pos-2">2°</div>
          <div className="stat-value">{formatCurrency(prizes[1].amount)}</div>
        </div>
      )}

      {/* 3° y 4° juntos */}
      <div className="stat-card prizes-small">
        {prizes[2] && (
          <div className="prize-small">
            <span className="prize-position pos-3">3°</span>
            <span className="prize-amount-small">{formatCurrency(prizes[2].amount)}</span>
          </div>
        )}
        {prizes[3] && (
          <div className="prize-small">
            <span className="prize-position pos-4">4°</span>
            <span className="prize-amount-small">{formatCurrency(prizes[3].amount)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
