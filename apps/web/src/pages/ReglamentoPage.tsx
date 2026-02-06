import { useState } from 'react'

export function ReglamentoPage() {
  const [author, setAuthor] = useState('')
  const [submittedAuthor, setSubmittedAuthor] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('torneo-regular')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Enviar sugerencia a Supabase
    setSubmitted(true)
    setSubmittedAuthor(author.trim())
    setAuthor('')
    setSuggestion('')
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Reglamento</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'torneo-regular', label: 'Torneo Regular' },
          { id: 'summer', label: 'Summer' },
          { id: 'final-seven', label: 'Final Seven' },
          { id: 'fraca', label: 'Fraca' },
          { id: 'participacion', label: 'Participación' },
          { id: 'convivencia', label: 'Convivencia' },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                isActive
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Contenido del reglamento */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-medium text-red-500">Reglas del Torneo</h2>

        {activeTab === 'torneo-regular' && (
          <div className="space-y-4 text-gray-300">
          <Rule title="Stack Inicial">
            Cada jugador comienza con 1000 fichas.
          </Rule>

          <Rule title="Recompras">
            Se permite máximo 1 recompra por jugador. La recompra otorga 1000 fichas adicionales.
          </Rule>

          <Rule title="Sistema de Puntos">
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>1° lugar: 16 puntos</li>
              <li>2° lugar: 10 puntos</li>
              <li>3° lugar: 7 puntos</li>
              <li>4° lugar: 4 puntos</li>
              <li>5° lugar: 2 puntos</li>
              <li>6° a 9° lugar: 1 punto <span className="text-gray-500">(mesa final)</span></li>
              <li>10° a penúltimo: 0.5 puntos <span className="text-gray-500">(presencial)</span></li>
              <li>Último lugar: -0.5 puntos <span className="text-gray-500">(penalización)</span></li>
            </ul>
          </Rule>

          <Rule title="Premios">
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>1° lugar: 40% del pozo</li>
              <li>2° lugar: 25% del pozo</li>
              <li>3° lugar: 15% del pozo</li>
              <li>4° lugar: 10% del pozo</li>
              <li>Sede/Caja: 10% del pozo</li>
            </ul>
          </Rule>

          <Rule title="Clasificación">
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Top 8: clasifican directo al Final Seven</li>
              <li>Puestos 9-16: clasifican al Fraca (semifinal)</li>
              <li>Ganador del Fraca: se suma al Final Seven</li>
            </ul>
          </Rule>

          <Rule title="Horario y tiempos muertos">
            La hora de inicio de cada fecha es a las 20:10: los jugadores presentes a esa hora reciben una bonificación de 100 fichas, mientras que quienes se incorporen luego tendrán una penalización equivalente a 5 veces la ciega grande vigente al momento de sentarse. Al finalizar el nivel de ciegas 25 / 50 se realizará un break de 30 minutos; una vez concluido el break, el juego se reanudará automáticamente y todo jugador que no haya regresado a su asiento será foldeado en cada mano hasta reincorporarse. Asimismo, cualquier jugador que no se encuentre en su posición cuando le corresponda actuar será automáticamente foldeado.
          </Rule>

          <Rule title="Reglas de desempate">
            En caso de que dos o más jugadores finalicen el torneo regular con la misma cantidad de puntos y sea necesario definir posiciones de clasificación, el desempate se resolverá priorizando, en este orden: mayor cantidad de primeros puestos (oros); si persiste la igualdad, mayor cantidad de segundos puestos (platas); luego terceros puestos (bronces) y así sucesivamente con las posiciones siguientes. Si aun así el empate continúa, tendrá prioridad el jugador que haya obtenido la mejor posición en la última fecha disputada.
          </Rule>
          </div>
        )}

        {activeTab === 'summer' && (
          <div className="text-gray-400">
            Contenido por definir.
          </div>
        )}

        {activeTab === 'final-seven' && (
          <div className="space-y-4 text-gray-300">
            <Rule title="Clasificación">
              <p>Clasifican los 8 mejores jugadores del Torneo Regular.</p>
              <p className="mt-2">El ganador del Fraca se suma al Final Seven.</p>
            </Rule>

            <Rule title="Stack Inicial">
              <p>El stack inicial es prorrateado según los puntos obtenidos en el Torneo Regular.</p>
              <p className="mt-2">El total de fichas en juego será de 18.000 fichas.</p>
            </Rule>

            <Rule title="Fecha">
              <p>La fecha oficial será el martes siguiente a la finalización del Torneo Regular.</p>
              <p className="mt-2">Solo podrá modificarse por decisión unánime de los clasificados.</p>
              <p className="mt-2">
                En caso de no haber unanimidad, el Final Seven se jugará igualmente, aunque algún jugador no pueda
                asistir.
              </p>
            </Rule>

            <Rule title="Horario">
              El horario de inicio se definirá de común acuerdo entre los finalistas.
            </Rule>
          </div>
        )}

        {activeTab === 'fraca' && (
          <div className="space-y-4 text-gray-300">
            <Rule title="Clasificación">
              <p>Lo disputan los jugadores ubicados en los puestos 9 al 16 del Torneo Regular.</p>
              <p className="mt-2">El ganador del Subzero se suma al Fraca.</p>
            </Rule>

            <Rule title="Formato">
              El Subzero y el Fraca se juegan la misma noche.
            </Rule>

            <Rule title="Stack Inicial">
              <p>El stack inicial es prorrateado según los puntos obtenidos en el Torneo Regular.</p>
              <p className="mt-2">El total de fichas en juego será de 18.000 fichas.</p>
            </Rule>

            <Rule title="Fecha">
              <p>Normalmente se juega el viernes posterior a la última fecha del Torneo Regular.</p>
              <p className="mt-2">La fecha podrá modificarse únicamente por decisión unánime de los clasificados.</p>
              <p className="mt-2">En caso contrario, el torneo se disputará igualmente.</p>
            </Rule>

            <Rule title="Horario">
              El horario de inicio se definirá de común acuerdo entre los jugadores clasificados.
            </Rule>
          </div>
        )}

        {activeTab === 'participacion' && (
          <div className="space-y-4 text-gray-300">
            <Rule title="Inscripción">
              <p>Los jugadores deben anotarse en alta, baja o duda hasta el martes a las 17:00.</p>
              <p className="mt-2">
                Los jugadores anotados como duda podrán incorporarse siempre que no se haya alcanzado el número máximo
                de participantes.
              </p>
            </Rule>

            <Rule title="Cupos">
              <p>La participación máxima por fecha es de 28 jugadores.</p>
              <p className="mt-2">La prioridad la tienen los granjeros, siempre que se den de alta antes del martes a las 17:00.</p>
              <p className="mt-2">
                Si al cierre de altas se supera el cupo de 28 jugadores, se dará de baja a los jugadores casuales.
              </p>
              <p className="mt-2">👉 Consultar la sección “Jugadores” para ver la lista de granjeros.</p>
            </Rule>

            <Rule title="Jugadores Casuales">
              <p>Para sumar un jugador casual un martes, el miembro que lo invita debe consultar exclusivamente con el Chiqui.</p>
              <p className="mt-2">
                La participación del jugador casual quedará sujeta a la aprobación del comité y a la disponibilidad de
                cupos, según las reglas anteriores.
              </p>
              <p className="mt-2">
                Es requisito que el jugador casual tenga conocimientos básicos de poker y sepa jugar; no se aceptan
                jugadores en etapa de aprendizaje.
              </p>
            </Rule>

            <Rule title="Incorporación como Granjero">
              <p>Un jugador casual podrá ser considerado para convertirse en granjero luego de acumular 12 presencias en un máximo de 15 fechas.</p>
              <p className="mt-2">La incorporación será evaluada y definida por el Comité de Gordos de Traje.</p>
            </Rule>
          </div>
        )}

        {activeTab === 'convivencia' && (
          <div className="space-y-4 text-gray-300">
            <Rule title="Comportamiento General">
              <p>Se espera un trato respetuoso entre todos los jugadores, tanto dentro como fuera de la mesa.</p>
              <p className="mt-2">
                No se permiten actitudes violentas, físicas ni verbales, ni comportamientos intimidantes hacia otros
                jugadores.
              </p>
            </Rule>

            <Rule title="Consumo">
              <p>El consumo de alcohol u otras sustancias debe ser moderado.</p>
              <p className="mt-2">
                No se permite jugar bajo estados de intoxicación que afecten el comportamiento, el ritmo de juego o la
                convivencia.
              </p>
              <p className="mt-2">
                Si un jugador se encuentra excesivamente drogado o alcoholizado, el comité podrá solicitar que abandone
                la mesa, sin derecho a reclamo.
              </p>
            </Rule>

            <Rule title="Juego y Ambiente">
              <p>Los jugadores deben mantener un ritmo de juego razonable y respetar las decisiones de la mesa y de la organización.</p>
              <p className="mt-2">Cualquier conflicto será resuelto por el Comité de Gordos de Traje, cuya decisión será final.</p>
            </Rule>
          </div>
        )}
      </section>

      {/* Form de sugerencias */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-medium mb-4">Sugerencias</h2>
        <p className="text-gray-400 text-sm mb-4">
          ¿Tenés alguna sugerencia para mejorar el reglamento?
        </p>

        {submitted && (
          <div className="mb-4 rounded-lg border border-yellow-500/60 bg-yellow-900/30 px-4 py-3 text-yellow-300 font-medium">
            Gracias por tu sugerencia{submittedAuthor ? `, ${submittedAuthor}` : ''}. Probablemente no la tomemos en cuenta, aca todo lo decide el Chiqui.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Tu nombre..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Escribí tu sugerencia..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
            rows={4}
          />
          <button
            type="submit"
            disabled={!suggestion.trim() || !author.trim()}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition"
          >
            Enviar
          </button>
        </form>
      </section>
    </div>
  )
}

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-medium text-white mb-1">{title}</h3>
      <div className="text-gray-400">{children}</div>
    </div>
  )
}
