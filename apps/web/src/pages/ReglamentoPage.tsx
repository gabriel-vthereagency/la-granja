import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, PageHeader, PageContainer } from '../components/ui'
import { fadeIn } from '../lib/motion'

const tabs = [
  { id: 'torneo-regular', label: 'Torneo Regular' },
  { id: 'summer', label: 'Summer' },
  { id: 'final-seven', label: 'Final Seven' },
  { id: 'fraca', label: 'Fraca' },
  { id: 'participacion', label: 'Participación' },
  { id: 'convivencia', label: 'Convivencia' },
]

export function ReglamentoPage() {
  const [author, setAuthor] = useState('')
  const [submittedAuthor, setSubmittedAuthor] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('torneo-regular')

  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestion.trim()) return
    setSending(true)
    try {
      const name = author.trim() || 'Anónimo'
      const text = `📩 *Sugerencia de ${name}*\n\n${suggestion.trim()}`
      const tgToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
      const tgChat = import.meta.env.VITE_TELEGRAM_CHAT_ID
      if (tgToken && tgChat) {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: Number(tgChat), text, parse_mode: 'Markdown' }),
        })
      }
    } catch {
      // Silently fail - still show success to user
    }
    setSending(false)
    setSubmitted(true)
    setSubmittedAuthor(author.trim())
    setAuthor('')
    setSuggestion('')
  }

  return (
    <PageContainer>
    <div className="space-y-8 max-w-3xl mx-auto">
      <PageHeader title="Reglamento" />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-full text-sm font-medium border transition ${
                isActive
                  ? 'border-accent/50 text-text-primary'
                  : 'border-glass-border text-text-secondary hover:border-accent/30 hover:text-text-primary'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-accent-muted"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Contenido del reglamento */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard as="section" className="p-6 space-y-4">
            <h2 className="text-xl font-medium text-accent">Reglas del Torneo</h2>

            {activeTab === 'torneo-regular' && (
              <div className="space-y-4 text-text-secondary">
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
                    <li>6° a 9° lugar: 1 punto <span className="text-text-tertiary">(mesa final)</span></li>
                    <li>10° a penúltimo: 0.5 puntos <span className="text-text-tertiary">(presencial)</span></li>
                    <li>Último lugar: -0.5 puntos <span className="text-text-tertiary">(penalización)</span></li>
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
              <div className="text-text-tertiary">
                Contenido por definir.
              </div>
            )}

            {activeTab === 'final-seven' && (
              <div className="space-y-4 text-text-secondary">
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
                  <p className="mt-2">En caso de no haber unanimidad, el Final Seven se jugará igualmente, aunque algún jugador no pueda asistir.</p>
                </Rule>
                <Rule title="Horario">
                  El horario de inicio se definirá de común acuerdo entre los finalistas.
                </Rule>
              </div>
            )}

            {activeTab === 'fraca' && (
              <div className="space-y-4 text-text-secondary">
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
              <div className="space-y-4 text-text-secondary">
                <Rule title="Inscripción">
                  <p>Los jugadores deben anotarse en alta, baja o duda hasta el martes a las 17:00.</p>
                  <p className="mt-2">Los jugadores anotados como duda podrán incorporarse siempre que no se haya alcanzado el número máximo de participantes.</p>
                </Rule>
                <Rule title="Cupos">
                  <p>La participación máxima por fecha es de 28 jugadores.</p>
                  <p className="mt-2">La prioridad la tienen los granjeros, siempre que se den de alta antes del martes a las 17:00.</p>
                  <p className="mt-2">Si al cierre de altas se supera el cupo de 28 jugadores, se dará de baja a los jugadores casuales.</p>
                  <p className="mt-2">Consultar la sección "Jugadores" para ver la lista de granjeros.</p>
                </Rule>
                <Rule title="Jugadores Casuales">
                  <p>Para sumar un jugador casual un martes, el miembro que lo invita debe consultar exclusivamente con el Chiqui.</p>
                  <p className="mt-2">La participación del jugador casual quedará sujeta a la aprobación del comité y a la disponibilidad de cupos, según las reglas anteriores.</p>
                  <p className="mt-2">Es requisito que el jugador casual tenga conocimientos básicos de poker y sepa jugar; no se aceptan jugadores en etapa de aprendizaje.</p>
                </Rule>
                <Rule title="Incorporación como Granjero">
                  <p>Un jugador casual podrá ser considerado para convertirse en granjero luego de acumular 12 presencias en un máximo de 15 fechas.</p>
                  <p className="mt-2">La incorporación será evaluada y definida por el Comité de Gordos de Traje.</p>
                </Rule>
              </div>
            )}

            {activeTab === 'convivencia' && (
              <div className="space-y-4 text-text-secondary">
                <Rule title="Comportamiento General">
                  <p>Se espera un trato respetuoso entre todos los jugadores, tanto dentro como fuera de la mesa.</p>
                  <p className="mt-2">No se permiten actitudes violentas, físicas ni verbales, ni comportamientos intimidantes hacia otros jugadores.</p>
                </Rule>
                <Rule title="Consumo">
                  <p>El consumo de alcohol u otras sustancias debe ser moderado.</p>
                  <p className="mt-2">No se permite jugar bajo estados de intoxicación que afecten el comportamiento, el ritmo de juego o la convivencia.</p>
                  <p className="mt-2">Si un jugador se encuentra excesivamente drogado o alcoholizado, el comité podrá solicitar que abandone la mesa, sin derecho a reclamo.</p>
                </Rule>
                <Rule title="Juego y Ambiente">
                  <p>Los jugadores deben mantener un ritmo de juego razonable y respetar las decisiones de la mesa y de la organización.</p>
                  <p className="mt-2">Cualquier conflicto será resuelto por el Comité de Gordos de Traje, cuya decisión será final.</p>
                </Rule>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Form de sugerencias */}
      <motion.div variants={fadeIn} initial="initial" animate="animate">
        <GlassCard as="section" className="p-6">
          <h2 className="text-xl font-medium mb-4">Sugerencias</h2>
          <p className="text-text-secondary text-sm mb-4">
            ¿Tenés alguna sugerencia para mejorar el reglamento?
          </p>

          {submitted && (
            <div className="mb-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-gold font-medium">
              Gracias por tu sugerencia{submittedAuthor ? `, ${submittedAuthor}` : ''}. Probablemente no la tomemos en cuenta, acá todo lo decide el Chiqui.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Tu nombre..."
              className="w-full px-4 py-2.5 bg-glass border border-glass-border rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition"
            />
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Escribí tu sugerencia..."
              className="w-full px-4 py-2.5 bg-glass border border-glass-border rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 resize-none transition"
              rows={4}
            />
            <button
              type="submit"
              disabled={!suggestion.trim() || !author.trim() || sending}
              className="px-6 py-2.5 bg-accent hover:bg-accent-light disabled:bg-surface-4 disabled:text-text-tertiary disabled:cursor-not-allowed rounded-xl font-medium transition"
            >
              Enviar
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
    </PageContainer>
  )
}

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-medium text-text-primary mb-1">{title}</h3>
      <div className="text-text-secondary">{children}</div>
    </div>
  )
}
