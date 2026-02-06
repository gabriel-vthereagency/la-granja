import { useStats } from '../hooks/useStats'
import { formatPoints } from '../utils/formatPoints'

export function EstadisticasPage() {
  const { stats, loading, error } = useStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Estadisticas</h1>
        <div className="text-gray-400">Cargando estadisticas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Estadisticas</h1>
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Estadisticas</h1>

      <div className="grid gap-6">
        <StatsTable title="Top Podios (Top 5)" data={stats.topPodiums} />
        <StatsTable title="Top Victorias (1°)" data={stats.topWins} />
        <StatsTable title="Top Ultimos Puestos" data={stats.topLastPlaces} />
        <StatsTable title="Top Burbujas (6°)" data={stats.topBubbles} />
        <StatsTable
          title="Top Efectividad"
          data={stats.topEffectiveness}
          formatValue={(v) => formatPoints(v)}
        />
        <StatsTable title="Top Presencias" data={stats.topPresences} />
      </div>
    </div>
  )
}

function StatsTable({
  title,
  data,
  formatValue,
}: {
  title: string
  data: Array<{ rank: number; player: string; value: number }>
  formatValue?: (value: number) => string
}) {
  return (
    <section className="bg-gray-800 rounded-lg overflow-hidden">
      <h2 className="px-4 py-3 bg-gray-700 font-medium">{title}</h2>
      <table className="w-full">
        <thead>
          <tr className="text-sm text-gray-400">
            <th className="px-4 py-2 text-left w-12">#</th>
            <th className="px-4 py-2 text-left">Jugador</th>
            <th className="px-4 py-2 text-right">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                Sin datos
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.rank} className="border-t border-gray-700">
                <td className="px-4 py-2 text-gray-400">{row.rank}</td>
                <td className="px-4 py-2">{row.player}</td>
                <td className="px-4 py-2 text-right text-green-400">
                  {formatValue ? formatValue(row.value) : row.value}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}
