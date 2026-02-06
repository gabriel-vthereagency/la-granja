import { getBlindLevel, formatBlinds } from '@lagranja/core'

interface LevelControlsProps {
  currentLevel: number
  isPaused: boolean
  onPlay: () => void
  onPause: () => void
  onNextLevel: () => void
  onPrevLevel: () => void
}

export function LevelControls({
  currentLevel,
  isPaused,
  onPlay,
  onPause,
  onNextLevel,
  onPrevLevel,
}: LevelControlsProps) {
  const level = getBlindLevel(currentLevel)
  const isBreak = level?.type === 'break'

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">
          {isBreak ? 'Break' : `Nivel ${currentLevel + 1}`}
        </div>
        <div className="text-3xl font-bold text-white">
          {level ? formatBlinds(level) : '-'}
        </div>
      </div>

      {/* Controles de nivel */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={onPrevLevel}
          className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
        >
          ← Nivel
        </button>

        <button
          onClick={onNextLevel}
          className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
        >
          Nivel →
        </button>
      </div>

      {/* Play/Pause */}
      <div className="flex justify-center">
        {isPaused ? (
          <button
            onClick={onPlay}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold text-xl"
          >
            ▶ PLAY
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white font-bold text-xl"
          >
            ⏸ PAUSA
          </button>
        )}
      </div>
    </div>
  )
}
