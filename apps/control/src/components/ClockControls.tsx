import { getBlindLevel, formatBlinds } from '@lagranja/core'

interface ClockControlsProps {
  currentLevel: number
  timeRemaining: number
  isPaused: boolean
  onPlay: () => void
  onPause: () => void
  onNextLevel: () => void
  onPrevLevel: () => void
  onSetTime: (seconds: number) => void
}

export function ClockControls({
  currentLevel,
  timeRemaining,
  isPaused,
  onPlay,
  onPause,
  onNextLevel,
  onPrevLevel,
  onSetTime,
}: ClockControlsProps) {
  const level = getBlindLevel(currentLevel)
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const isBreak = level?.type === 'break'

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">
          {isBreak ? 'Break' : `Nivel ${currentLevel + 1}`}
        </div>
        <div className="text-4xl font-bold text-white mb-2">
          {level ? formatBlinds(level) : '-'}
        </div>
        <div className="text-6xl font-mono font-bold text-white">
          {formattedTime}
        </div>
      </div>

      {/* Controles principales */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={onPrevLevel}
          className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
        >
          ← Nivel
        </button>

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

        <button
          onClick={onNextLevel}
          className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
        >
          Nivel →
        </button>
      </div>

      {/* Ajuste de tiempo */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => onSetTime(timeRemaining - 60)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          -1 min
        </button>
        <button
          onClick={() => onSetTime(timeRemaining - 10)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          -10 seg
        </button>
        <button
          onClick={() => onSetTime(timeRemaining + 10)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          +10 seg
        </button>
        <button
          onClick={() => onSetTime(timeRemaining + 60)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          +1 min
        </button>
      </div>
    </div>
  )
}
