import { calculatePrizePool, formatCurrency } from '@lagranja/core'

interface PrizePoolProps {
  entries: number
  rebuys: number
  buyInAmount: number
}

export function PrizePool({ entries, rebuys, buyInAmount }: PrizePoolProps) {
  const breakdown = calculatePrizePool(entries, rebuys, buyInAmount)

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="text-center mb-4">
        <div className="text-gray-400 text-sm uppercase tracking-wider">
          Pozo Total
        </div>
        <div className="text-4xl font-bold text-green-500">
          {formatCurrency(breakdown.netPool)}
        </div>
        <div className="text-gray-500 text-xs mt-1">
          ({entries} entradas + {rebuys} recompras)
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        {breakdown.prizes.slice(0, 4).map((prize) => (
          <div key={prize.position}>
            <div className="text-gray-500">{prize.position}°</div>
            <div className="text-white font-medium">
              {formatCurrency(prize.amount)}
            </div>
            <div className="text-yellow-500 text-xs">{prize.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  )
}
