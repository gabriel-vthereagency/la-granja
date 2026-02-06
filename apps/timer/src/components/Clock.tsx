interface ClockProps {
  timeRemaining: number // segundos
  isPaused: boolean
}

export function Clock({ timeRemaining, isPaused }: ClockProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="text-center">
      <div
        className={`text-[12rem] font-mono font-bold leading-none tracking-tight ${
          isPaused ? 'text-yellow-500' : 'text-white'
        }`}
      >
        {formattedTime}
      </div>
      {isPaused && (
        <div className="text-2xl text-yellow-500 uppercase tracking-widest mt-2">
          Pausado
        </div>
      )}
    </div>
  )
}
