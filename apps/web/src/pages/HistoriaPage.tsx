export function HistoriaPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Historia de La Granja</h1>

      {/* Manifiesto */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-medium text-red-500 mb-4">El Manifiesto</h2>
        <div className="prose prose-invert text-gray-300 space-y-4">
          <p>
            <em>"No tratés de entenderla, disfrutála"</em>
          </p>
          <p>
            La Granja nació como un grupo de amigos que se juntaba los martes
            a jugar poker. Lo que empezó como una excusa para vernos, se convirtió
            en una tradición.
          </p>
          <p>
            Acá no importa si sos bueno o malo, si ganás o perdés. Lo que importa
            es que estés presente, que compartas la mesa, y que disfrutes el momento.
          </p>
          <p className="text-gray-500 italic">
            (Contenido por completar...)
          </p>
        </div>
      </section>

      {/* Galería de fotos */}
      <section>
        <h2 className="text-xl font-medium mb-4">Galería</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-gray-600"
            >
              Foto {i}
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-4 text-center">
          (Fotos por agregar)
        </p>
      </section>
    </div>
  )
}
