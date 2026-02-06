import { getBlindLevel, getNextPlayableLevel, formatBlinds } from '@lagranja/core'

interface BlindsDisplayProps {
  currentLevelIndex: number
}

export function BlindsDisplay({ currentLevelIndex }: BlindsDisplayProps) {
  const currentLevel = getBlindLevel(currentLevelIndex)
  const nextLevel = getNextPlayableLevel(currentLevelIndex)

  if (!currentLevel) {
    return null
  }

  const isBreak = currentLevel.type === 'break'

  return (
    <div className="flex justify-between items-start gap-8">
      {/* Nivel actual */}
      <div className="text-center flex-1">
        <div className="text-gray-400 text-lg uppercase tracking-wider mb-1">
          {isBreak ? 'Break' : `Nivel ${currentLevelIndex + 1}`}
        </div>
        <div className="text-6xl font-bold text-white">
          {formatBlinds(currentLevel)}
        </div>
      </div>

      {/* Próximo nivel */}
      {nextLevel && (
        <div className="text-center flex-1 opacity-60">
          <div className="text-gray-500 text-lg uppercase tracking-wider mb-1">
            Próximo
          </div>
          <div className="text-4xl font-bold text-gray-400">
            {formatBlinds(nextLevel)}
          </div>
        </div>
      )}
    </div>
  )
}
