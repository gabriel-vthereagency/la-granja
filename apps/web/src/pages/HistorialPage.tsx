import { Link } from 'react-router-dom'
import { useSeasons } from '../hooks/useSeasons'

export function HistorialPage() {
  const { seasons, loading, error } = useSeasons()

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Historial de Torneos</h1>
        <div className="text-gray-400">Cargando temporadas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Historial de Torneos</h1>
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  // Agrupar por año
  const byYear = seasons.reduce(
    (acc, s) => {
      const bucket = acc[s.year] ?? []
      bucket.push(s)
      acc[s.year] = bucket
      return acc
    },
    {} as Record<number, typeof seasons>
  )

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)

  const typeColors: Record<string, string> = {
    apertura: 'border-l-green-500',
    clausura: 'border-l-blue-500',
    summer: 'border-l-yellow-500',
  }

  const statusBadge: Record<string, { label: string; class: string }> = {
    active: { label: 'En curso', class: 'bg-green-600' },
    finished: { label: 'Finalizado', class: 'bg-gray-600' },
    upcoming: { label: 'Próximo', class: 'bg-blue-600' },
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Historial de Torneos</h1>

      {years.map((year) => {
        const seasonsForYear = byYear[year] ?? []
        return (
          <div key={year}>
          <h2 className="text-lg font-medium text-gray-400 mb-3">{year}</h2>
          <div className="grid gap-3">
            {seasonsForYear.map((season) => (
              <Link
                key={season.id}
                to={`/historial/${season.id}`}
                className={`bg-gray-800 hover:bg-gray-700 rounded-lg p-5 transition border-l-4 ${typeColors[season.type] ?? ''}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{season.name}</h3>
                    <p className="text-gray-500 text-sm capitalize">{season.type}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${statusBadge[season.status]?.class ?? 'bg-gray-700'}`}
                  >
                    {statusBadge[season.status]?.label ?? season.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        )
      })}

      {seasons.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay temporadas registradas
        </div>
      )}
    </div>
  )
}
