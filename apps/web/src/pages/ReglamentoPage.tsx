import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, PageHeader, PageContainer } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'

/* ─── Tab definitions ─────────────────────────────────────────────── */
const tabs = [
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'sede', label: 'Sede', icon: '🏠' },
  { id: 'regular', label: 'Torneo Regular', icon: '♠️' },
  { id: 'final', label: 'Final Seven', icon: '🏆' },
  { id: 'fraca', label: 'Fraca & SubZero', icon: '🔥' },
  { id: 'summer', label: 'Summer Cup', icon: '☀️' },
  { id: 'participacion', label: 'Participación', icon: '👥' },
  { id: 'convivencia', label: 'Convivencia', icon: '🤝' },
]

/* ─── Blind structure data ────────────────────────────────────────── */
const REGULAR_BLINDS: [number, number, number, number][] = [
  [1,2,4,12],[2,3,6,12],[3,4,8,12],[4,5,10,12],[5,6,12,12],[6,7,14,12],
  [7,8,16,12],[8,10,20,12],[9,15,30,12],[10,20,40,12],[11,25,50,12],
  [12,30,60,15],[13,40,80,15],[14,50,100,15],[15,60,120,15],[16,80,160,15],
  [17,100,200,15],[18,120,240,15],[19,150,300,15],[20,200,400,15],
  [21,250,500,15],[22,300,600,15],[23,350,700,15],[24,400,800,15],
  [25,500,1000,15],[26,600,1200,15],[27,700,1400,15],
]

const SUBZERO_BLINDS: [number, number, number][] = [
  [1,5,10],[2,10,20],[3,15,30],[4,20,40],[5,25,50],[6,40,80],
  [7,50,100],[8,75,150],[9,100,200],[10,150,300],[11,200,400],[12,250,500],
]

/* ─── Main page ───────────────────────────────────────────────────── */
export function ReglamentoPage() {
  const [activeTab, setActiveTab] = useState('calendario')
  const [author, setAuthor] = useState('')
  const [submittedAuthor, setSubmittedAuthor] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [submitted, setSubmitted] = useState(false)
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
    } catch { /* silently fail */ }
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

        {/* Year badge */}
        <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex justify-center">
          <span className="px-4 py-1.5 rounded-full border border-accent/30 bg-accent-muted text-accent-light text-sm font-semibold tracking-wider">
            TEMPORADA 2026
          </span>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
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
                <span className="relative z-10">
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'calendario' && <CalendarioTab />}
            {activeTab === 'sede' && <SedeTab />}
            {activeTab === 'regular' && <RegularTab />}
            {activeTab === 'final' && <FinalSevenTab />}
            {activeTab === 'fraca' && <FracaTab />}
            {activeTab === 'summer' && <SummerTab />}
            {activeTab === 'participacion' && <ParticipacionTab />}
            {activeTab === 'convivencia' && <ConvivenciaTab />}
          </motion.div>
        </AnimatePresence>

        {/* Suggestion form */}
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

/* ═══════════════════════════════════════════════════════════════════ */
/*  Reusable building blocks                                         */
/* ═══════════════════════════════════════════════════════════════════ */

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-text-primary mb-1.5">{title}</h3>
      <div className="text-text-secondary text-[15px] leading-relaxed">{children}</div>
    </div>
  )
}

function Callout({ children, variant = 'accent' }: { children: React.ReactNode; variant?: 'accent' | 'gold' | 'blue' }) {
  const styles = {
    accent: 'border-accent/40 bg-accent/5 text-accent-light',
    gold: 'border-gold/40 bg-gold/5 text-gold',
    blue: 'border-blue-400/40 bg-blue-400/5 text-blue-300',
  }
  return (
    <div className={`rounded-xl border-l-4 px-4 py-3 text-sm font-medium ${styles[variant]}`}>
      {children}
    </div>
  )
}

function DataTable({ headers, rows, compact }: { headers: string[]; rows: (string | number)[][]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-glass-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-glass-border bg-surface-2/60">
            {headers.map((h) => (
              <th key={h} className={`${compact ? 'px-3 py-2' : 'px-4 py-2.5'} text-left font-semibold text-text-tertiary uppercase text-xs tracking-wider`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-glass-border/50 ${i % 2 === 0 ? 'bg-glass/20' : ''}`}>
              {row.map((cell, j) => (
                <td key={j} className={`${compact ? 'px-3 py-1.5' : 'px-4 py-2'} text-text-secondary`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="rounded-xl border border-glass-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-2/40 hover:bg-surface-2/60 transition text-left"
      >
        <span className="font-medium text-text-primary text-sm">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-tertiary text-lg"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-glass-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={staggerItem}>
      <GlassCard className="p-5 md:p-6 space-y-5">
        {children}
      </GlassCard>
    </motion.div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-accent tracking-tight">{children}</h2>
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Tab content components                                           */
/* ═══════════════════════════════════════════════════════════════════ */

function CalendarioTab() {
  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      <SectionCard>
        <SectionTitle>Estructura Anual</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Apertura', period: 'Marzo — Julio', detail: '20 fechas', color: 'border-accent/40 bg-accent/5' },
            { name: 'Clausura', period: 'Agosto — Diciembre', detail: '20 fechas', color: 'border-accent/40 bg-accent/5' },
            { name: 'Summer Cup', period: 'Enero — Febrero', detail: '9-10 fechas', color: 'border-gold/40 bg-gold/5' },
            { name: 'Playoffs', period: 'Post temporada', detail: 'SubZero + Fraca + Final', color: 'border-blue-400/40 bg-blue-400/5' },
          ].map((t) => (
            <div key={t.name} className={`rounded-xl border-l-4 px-4 py-3 ${t.color}`}>
              <div className="font-semibold text-text-primary">{t.name}</div>
              <div className="text-sm text-text-secondary">{t.period}</div>
              <div className="text-xs text-text-tertiary mt-1">{t.detail}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Camino al Final Seven</SectionTitle>
        <div className="flex flex-col gap-2">
          {[
            { pos: 'Top 8', dest: 'Final Seven', tag: 'Clasificación directa', color: 'text-accent' },
            { pos: '9° — 16°', dest: 'Fraca Seven', tag: 'Repechaje', color: 'text-gold' },
            { pos: '17° en adelante', dest: 'SubZero', tag: 'Pre-repechaje', color: 'text-blue-300' },
          ].map((r) => (
            <div key={r.pos} className="flex items-center gap-3 rounded-lg bg-surface-2/40 px-4 py-2.5">
              <span className={`font-semibold text-sm ${r.color} min-w-[120px]`}>{r.pos}</span>
              <span className="text-text-tertiary">→</span>
              <span className="font-medium text-text-primary text-sm">{r.dest}</span>
              <span className="ml-auto text-xs text-text-tertiary hidden sm:inline">{r.tag}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-tertiary mt-2">
          El ganador del SubZero se suma al Fraca. El ganador del Fraca se suma al Final Seven.
        </p>
      </SectionCard>

    </motion.div>
  )
}

function SedeTab() {
  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      <SectionCard>
        <SectionTitle>Sede TATAMI</SectionTitle>
        <Rule title="Inscripción">
          Se abona un valor monetario definido por los GdT al comienzo de cada torneo, destinado al pago de sede, paños, naipes y otros gastos operativos.
        </Rule>
        <Rule title="Cuidado de la sede">
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Cada jugador debe guardar su silla antes de retirarse</li>
            <li>Tirar su basura y llevar la vajilla a la cocina</li>
            <li>Eliminado en posición 17: obligado a cerrar mesa N°3</li>
            <li>Eliminado en posición 10: obligado a cerrar mesa N°2 y dejar todo ordenado</li>
          </ul>
        </Rule>
        <Callout>CUIDEMOS LA SEDE</Callout>
      </SectionCard>
    </motion.div>
  )
}

function RegularTab() {
  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      <SectionCard>
        <SectionTitle>Formato del Torneo</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Fechas', value: '20', sub: 'Todos los martes' },
            { label: 'Stack', value: '1.000', sub: 'fichas iniciales' },
            { label: 'Recompra', value: '1 máx', sub: '1.000 fichas' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-surface-2/50 p-3 text-center">
              <div className="text-xl font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-tertiary">{s.sub}</div>
              <div className="text-xs font-medium text-text-secondary mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Sistema de Puntos</SectionTitle>
        <DataTable
          headers={['Posición', 'Puntos']}
          rows={[
            ['🥇 1° lugar', '16'],
            ['🥈 2° lugar', '10'],
            ['🥉 3° lugar', '7'],
            ['4° lugar', '4'],
            ['5° lugar', '2'],
            ['6° a 9° (mesa final)', '1'],
            ['10° a penúltimo', '0.5'],
            ['💀 Último lugar', '-0.5'],
          ]}
        />
      </SectionCard>

      <SectionCard>
        <SectionTitle>Premios por Fecha</SectionTitle>
        <DataTable
          headers={['Posición', '% del Pozo']}
          rows={[
            ['🥇 1° lugar', '40%'],
            ['🥈 2° lugar', '25%'],
            ['🥉 3° lugar', '15%'],
            ['4° lugar', '10%'],
            ['Pozo acumulado F7', '10%'],
          ]}
        />
      </SectionCard>

      <SectionCard>
        <SectionTitle>Horarios y Dinámica</SectionTitle>
        <Rule title="Inicio del torneo">
          <p>Hora de inicio: <strong className="text-text-primary">20:10 hs</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1.5">
            <li>Jugadores presentes a las 20:10 reciben <strong className="text-success">+100 fichas</strong> de bonificación</li>
            <li>Quienes lleguen después: penalización de <strong className="text-accent-light">5x la ciega grande</strong> vigente</li>
            <li>Se entiende que son torneos SIN registro tardío; la quita equivale a las ciegas que le habrían quemado hasta su llegada</li>
          </ul>
        </Rule>
        <Callout>
          Se considera PRESENTE a quien esté físicamente dentro de TATAMI, en el 2do piso, a las 20:10. No cuenta estar en la puerta, estacionando, subiendo por el ascensor o "avisando que ya llega".
        </Callout>
        <Rule title="Sorteo y arranque">
          <ul className="list-disc list-inside space-y-1.5">
            <li><strong className="text-text-primary">20:10</strong> — Límite para las 100 fichas extras</li>
            <li><strong className="text-text-primary">20:10 – 20:15</strong> — Sorteo entre los presentes. Los que llegan en ese intervalo ingresan fuera de sorteo</li>
            <li><strong className="text-text-primary">20:15</strong> — Comienza el reloj y la quita de ciegas a los ingresantes tardíos</li>
          </ul>
        </Rule>
        <Rule title="Break">
          <p>Al finalizar el Nivel 11 (ciegas 25/50) se realiza un <strong className="text-text-primary">break de 30 minutos</strong>.</p>
          <ul className="list-disc list-inside mt-2 space-y-1.5">
            <li>Todo jugador que no haya regresado será foldeado automáticamente</li>
            <li>Si un granjero llega durante el break: ingresa con 1.000 fichas, abonando caja y recompra</li>
            <li>Si llega después del break: puede entrar solo con previo aviso y tótem colocado</li>
          </ul>
        </Rule>
        <Callout variant="gold">
          Los martes feriados, todo se adelanta 1h10m: el límite de 100 extras pasa a las 19:00 hs.
        </Callout>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Reglas de Desempate</SectionTitle>
        <p className="text-text-secondary text-sm mb-3">Para definir posiciones de clasificación al Final Seven y Fraca Seven:</p>
        <div className="space-y-2">
          {[
            { n: 1, text: 'Mayor cantidad de puntos totales' },
            { n: 2, text: 'Mayor cantidad de primeros puestos (oros)' },
            { n: 3, text: 'Mayor cantidad de segundos puestos (platas)' },
            { n: 4, text: 'Mayor cantidad de terceros puestos (bronces)' },
            { n: 5, text: 'Y así sucesivamente (4tos, 5tos...)' },
            { n: 6, text: 'Menor cantidad de últimos puestos' },
            { n: 7, text: 'Mejor posición en la última fecha disputada' },
          ].map((r) => (
            <div key={r.n} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-muted text-accent-light text-xs font-bold flex items-center justify-center mt-0.5">
                {r.n}
              </span>
              <span className="text-text-secondary text-sm">{r.text}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Restricción Fecha 20</SectionTitle>
        <Rule title="Requisitos mínimos de presencias para clasificar">
          <p>No puede jugar la fecha 20 quien no haya jugado ninguna fecha anterior (salvo granjeros que vivan a +500km de la sede).</p>
          <p className="mt-2">Se requiere un <strong className="text-text-primary">mínimo de 4 fechas jugadas</strong> para clasificar a cualquier fase siguiente (SubZero, Fraca, Final).</p>
        </Rule>
        <DataTable
          headers={['Distancia a la sede', 'Fechas mínimas']}
          rows={[
            ['Menos de 100 km', '2 fechas'],
            ['100 – 500 km', '1 fecha'],
            ['Más de 500 km', '1 fecha'],
            ['Resto', '4 fechas'],
          ]}
        />
      </SectionCard>

      <SectionCard>
        <SectionTitle>Formato de Mesas</SectionTitle>
        <DataTable
          headers={['Jugadores', 'Mesas']}
          rows={[
            ['Hasta 9', '1 mesa'],
            ['10 a 18', '2 mesas'],
            ['19 a 27', '3 mesas'],
            ['28 a 36', '4 mesas'],
          ]}
        />
        <Accordion title="Dinámica de inicio y reagrupamientos">
          <div className="space-y-3 text-sm text-text-secondary">
            <p>Con <strong className="text-text-primary">6 jugadores</strong> se da comienzo al juego. Si a las 20:15 no hay mínimo, se arranca el reloj y se espera.</p>

            <div className="rounded-lg bg-surface-2/40 p-3">
              <p className="font-semibold text-text-primary mb-1">Llegada del jugador 10 (apertura mesa 2)</p>
              <p>Se sortean los 4 naipes más bajos que pasarán a la mesa N°2. Las posiciones se sortean ya que no incide el monto de las ciegas.</p>
              <p className="text-xs text-text-tertiary mt-1">Si llegan 2-3 juntos: sortean los 3 más bajos. Si llegan 4-5 juntos: sortean los 2 más bajos.</p>
            </div>

            <div className="rounded-lg bg-surface-2/40 p-3">
              <p className="font-semibold text-text-primary mb-1">Llegada del jugador 17 (apertura mesa 3)</p>
              <p>El que llega es Dealer. Se sortean los 2 naipes más bajos de cada mesa.</p>
              <p className="text-xs text-text-tertiary mt-1">Los de mesa 1 se ubican a derecha de los ingresantes. Los de mesa 2 son SB y BB.</p>
            </div>

            <div className="rounded-lg bg-surface-2/40 p-3">
              <p className="font-semibold text-text-primary mb-1">Eliminación del jugador 17 (cierre mesa 3)</p>
              <p>Ocurre cuando las mesas están en 6-6-5:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Si el eliminado es de la mesa de 5: los 4 restantes se reparten por sorteo, naipes más altos a la mesa de menor numeración</li>
                <li>Si es de una mesa de 6: se redistribuyen para completar 8 jugadores en cada mesa</li>
              </ul>
            </div>

            <div className="rounded-lg bg-surface-2/40 p-3">
              <p className="font-semibold text-accent-light mb-1">Eliminación del jugador 10 — MESA FINAL</p>
              <p>La mesa que elimina al jugador 10 es la <strong className="text-text-primary">DOMINANTE</strong>. La otra es la <strong className="text-text-primary">DOMINADA</strong>.</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Dominante:</strong> se ubica en DEALER (BUTTON), CO, HJ, UTG+3</li>
                <li><strong>Dominada:</strong> se ubica en SB, BB, UTG, UTG+1, UTG+2</li>
              </ul>
              <p className="text-xs text-text-tertiary mt-1">Si se van dos simultáneamente, se sortea cuál es la dominante.</p>
            </div>

            <div className="rounded-lg bg-surface-2/40 p-3">
              <p className="font-semibold text-text-primary mb-1">Cuestiones generales</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Cambios de mesa: &quot;pasa el de atrás del dealer, se ubica atrás del dealer&quot;</li>
                <li>Cada eliminación debe anunciarse inmediatamente para la pantalla y reagrupamientos</li>
                <li>En el break se sacan fichas #1, redondeando al múltiplo de 5 más cercano para arriba</li>
                <li>Desde Nivel 17 (100/200) se sacan fichas #5 y #10, redondeando al múltiplo de 25</li>
                <li>En mesa final se pueden sacar algunas fichas #25 (se usan hasta nivel 23)</li>
              </ul>
            </div>
          </div>
        </Accordion>
      </SectionCard>

      <SectionCard>
        <Accordion title="Esquema de Ciegas — Torneo Regular">
          <DataTable
            compact
            headers={['Nivel', 'SB', 'BB', 'Duración']}
            rows={REGULAR_BLINDS.map(([lvl, sb, bb, dur]) => [
              `Nivel ${lvl}`,
              sb.toLocaleString(),
              bb.toLocaleString(),
              `${dur}'`,
            ])}
          />
          <p className="text-xs text-text-tertiary mt-2">Niveles 1-11: 12 minutos. Niveles 12+: 15 minutos.</p>
        </Accordion>
      </SectionCard>
    </motion.div>
  )
}

function FinalSevenTab() {
  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      <SectionCard>
        <SectionTitle>Final Seven</SectionTitle>
        <Rule title="Clasificación">
          <p>Clasifican los <strong className="text-text-primary">8 mejores jugadores</strong> del Torneo Regular, más el ganador del Fraca Seven = <strong className="text-accent-light">9 jugadores</strong>.</p>
        </Rule>
        <Rule title="Stack inicial">
          <p>El stack es <strong className="text-text-primary">prorrateado según los puntos obtenidos</strong> en el Torneo Regular.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>El jugador del Fraca ingresa con el <strong className="text-text-primary">50% del stack del 8vo clasificado</strong></li>
            <li>Total de fichas en juego: <strong className="text-text-primary">18.000</strong></li>
          </ul>
        </Rule>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Fecha y Horario</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border-l-4 border-accent/40 bg-accent/5 px-4 py-3">
            <div className="font-semibold text-text-primary">Apertura</div>
            <div className="text-sm text-text-secondary">Martes siguiente a la última fecha regular</div>
            <div className="text-xs text-text-tertiary mt-1">Inicio: 20:30 hs (salvo común acuerdo)</div>
          </div>
          <div className="rounded-xl border-l-4 border-gold/40 bg-gold/5 px-4 py-3">
            <div className="font-semibold text-text-primary">Clausura</div>
            <div className="text-sm text-text-secondary">Sábado siguiente, sede en provincia + asado</div>
            <div className="text-xs text-text-tertiary mt-1">Inicio: 13:00 hs (salvo común acuerdo)</div>
          </div>
        </div>
        <Callout>
          La fecha solo puede modificarse por decisión unánime de los clasificados. Si no hay unanimidad, se juega igual aunque alguien no pueda asistir.
        </Callout>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Premios</SectionTitle>
        <DataTable
          headers={['Posición', '% Pozo Acumulado']}
          rows={[
            ['🏆 HOF (Campeón)', '55%'],
            ['🥈 2° lugar', '30%'],
            ['🥉 3° lugar', '15%'],
          ]}
        />
      </SectionCard>

      <SectionCard>
        <Accordion title="Esquema de Ciegas — Final Seven">
          <DataTable
            compact
            headers={['Nivel', 'SB', 'BB', 'Duración']}
            rows={REGULAR_BLINDS.map(([lvl, sb, bb]) => [
              `Nivel ${lvl}`,
              sb.toLocaleString(),
              bb.toLocaleString(),
              "15'",
            ])}
          />
          <p className="text-xs text-text-tertiary mt-2">Todos los niveles son de 15 minutos.</p>
        </Accordion>
      </SectionCard>
    </motion.div>
  )
}

function FracaTab() {
  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      <SectionCard>
        <SectionTitle>Fraca Seven (Repechaje)</SectionTitle>
        <Rule title="Clasificación">
          <p>Lo disputan los jugadores ubicados en los puestos <strong className="text-text-primary">9 al 16</strong> del Torneo Regular, más el ganador del SubZero = <strong className="text-gold">9 jugadores</strong>.</p>
        </Rule>
        <Rule title="Formato">
          Formato de juego y esquema de ciegas similar al Final Seven.
        </Rule>
        <Rule title="Stack inicial">
          <p>Prorrateado según puntos obtenidos en el Torneo Regular.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>El jugador del SubZero ingresa con el <strong className="text-text-primary">50% del stack del 16vo clasificado</strong></li>
            <li>Total de fichas en juego: <strong className="text-text-primary">18.000</strong></li>
          </ul>
        </Rule>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Fecha y Horario</SectionTitle>
        <Rule title="Fecha">
          <p>Se juega el <strong className="text-text-primary">viernes posterior</strong> a la última fecha del Torneo Regular.</p>
          <p className="mt-1">Puede moverse entre viernes y lunes solo por unanimidad. Si se posterga el Final Seven, puede posponerse de común acuerdo entre los 9 participantes.</p>
        </Rule>
        <Rule title="Horario">
          <p>Inicio: <strong className="text-text-primary">21:30 hs</strong>, sujeto a la finalización del SubZero, sin poder comenzar luego de las 22 hs.</p>
          <p className="text-xs text-text-tertiary mt-1">Si el SubZero comenzó tarde, se resuelve en el momento, pudiendo colocar un tótem para quien llegue del repechaje.</p>
        </Rule>
      </SectionCard>

      <SectionCard>
        <SectionTitle>SubZero (Pre-repechaje)</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Formato', value: 'Hiper-turbo' },
            { label: 'Duración', value: '~1h30m' },
            { label: 'Stack', value: '500' },
            { label: 'Niveles', value: "12 x 7'" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-surface-2/50 p-3 text-center">
              <div className="text-lg font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-tertiary">{s.label}</div>
            </div>
          ))}
        </div>
        <Rule title="Clasificación">
          <p>Lo juegan todos los clasificados en posiciones <strong className="text-text-primary">17 en adelante</strong>, con un mínimo de 4 fechas jugadas.</p>
        </Rule>
        <Rule title="Horario">
          <p>Se juega la misma noche, previo al Fraca. Arranca entre <strong className="text-text-primary">19:30 y 20:00 hs</strong>.</p>
          <p className="text-xs text-text-tertiary mt-1">Es condición necesaria anotarse antes de las 18:00 del mismo día.</p>
        </Rule>
      </SectionCard>

      <SectionCard>
        <Accordion title="Esquema de Ciegas — SubZero">
          <DataTable
            compact
            headers={['Nivel', 'SB', 'BB', 'Duración']}
            rows={SUBZERO_BLINDS.map(([lvl, sb, bb]) => [
              `Nivel ${lvl}`,
              sb.toString(),
              bb.toString(),
              "7'",
            ])}
          />
          <p className="text-xs text-text-tertiary mt-2">Todos los niveles son de 7 minutos. Puede modificarse según cantidad de participantes.</p>
        </Accordion>
      </SectionCard>
    </motion.div>
  )
}

function SummerTab() {
  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      <SectionCard>
        <SectionTitle>Summer Cup</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Fechas', value: '9-10', sub: 'Enero y Febrero' },
            { label: 'Stack Final', value: '40.000', sub: 'fichas totales' },
            { label: 'Mín. fechas', value: '2', sub: 'para mesa final' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-surface-2/50 p-3 text-center">
              <div className="text-xl font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-tertiary">{s.sub}</div>
              <div className="text-xs font-medium text-text-secondary mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <Rule title="Mesa Final">
          Incluye a todos los que hayan jugado al menos <strong className="text-text-primary">2 fechas</strong>. Cada integrante juega con stack ponderado según puntos, con un total de 40.000 fichas.
        </Rule>
        <Rule title="Reglas generales">
          Mismas condiciones que los torneos regulares: stack inicial, recompras, sistema de puntos y horarios.
        </Rule>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Sistema de Bounties</SectionTitle>
        <Rule title="Funcionamiento">
          <p>En cada fecha se recolecta un importe adicional para bounties:</p>
          <ul className="list-disc list-inside mt-2 space-y-1.5">
            <li><strong className="text-success">75%</strong> se adjudica al ganador de cada bounty</li>
            <li><strong className="text-gold">25%</strong> se retiene para el &quot;Rey del Bounty&quot;</li>
            <li>Cada bounty obtenido otorga <strong className="text-success">+0.20 puntos extras</strong></li>
          </ul>
        </Rule>
        <Callout variant="gold">
          Rey del Bounty: quien obtenga la mayor cantidad de bounties en la totalidad de las fechas Summer.
        </Callout>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Premios</SectionTitle>
        <DataTable
          headers={['Posición', '% Pozo Acumulado']}
          rows={[
            ['☀️ Summer Champion', '55%'],
            ['🥈 2° lugar', '30%'],
            ['🥉 3° lugar', '15%'],
          ]}
        />
      </SectionCard>
    </motion.div>
  )
}

function ParticipacionTab() {
  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      <SectionCard>
        <SectionTitle>Inscripción</SectionTitle>
        <Rule title="Anotación semanal">
          <p>Los jugadores deben anotarse en <strong className="text-text-primary">alta, baja o duda</strong> hasta el martes a las <strong className="text-text-primary">19:00 hs</strong>.</p>
          <p className="mt-2">Los jugadores anotados como &quot;duda&quot; podrán incorporarse siempre que no se haya alcanzado el número máximo de participantes.</p>
        </Rule>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Cupos</SectionTitle>
        <Rule title="Máximo por fecha">
          <p>La participación máxima es de <strong className="text-text-primary">28 jugadores</strong>.</p>
          <ul className="list-disc list-inside mt-2 space-y-1.5">
            <li>Los granjeros tienen prioridad si se anotan antes del martes a las <strong className="text-text-primary">17:00</strong></li>
            <li>Si se supera el cupo de 28, se dará de baja a los jugadores casuales</li>
          </ul>
        </Rule>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Jugadores Casuales</SectionTitle>
        <Rule title="Requisitos">
          <ul className="list-disc list-inside space-y-1.5">
            <li>El miembro que invite debe consultar exclusivamente con el <strong className="text-text-primary">Chiqui</strong></li>
            <li>Sujeto a aprobación del comité y disponibilidad de cupos</li>
            <li>El jugador casual debe tener conocimientos básicos de poker</li>
          </ul>
        </Rule>
        <Callout variant="blue">
          No se aceptan jugadores en etapa de aprendizaje.
        </Callout>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Incorporación como Granjero</SectionTitle>
        <Rule title="Proceso">
          <p>Un jugador casual podrá ser considerado para convertirse en granjero luego de acumular <strong className="text-text-primary">12 presencias en un máximo de 15 fechas</strong>.</p>
          <p className="mt-2">La incorporación será evaluada y definida por el <strong className="text-text-primary">Comité de Gordos de Traje</strong>.</p>
        </Rule>
      </SectionCard>
    </motion.div>
  )
}

function ConvivenciaTab() {
  return (
    <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
      <SectionCard>
        <SectionTitle>Comportamiento General</SectionTitle>
        <Rule title="Trato entre jugadores">
          <p>Se espera un trato <strong className="text-text-primary">respetuoso</strong> entre todos los jugadores, tanto dentro como fuera de la mesa.</p>
          <p className="mt-2">No se permiten actitudes violentas, físicas ni verbales, ni comportamientos intimidantes.</p>
        </Rule>
        <div className="space-y-2">
          <Callout>
            Cualquier agresión física será motivo suficiente de expulsión del torneo.
          </Callout>
          <Callout variant="gold">
            Cualquier agresión verbal será advertida por los GdT. La reincidencia es expulsión automática.
          </Callout>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Consumo</SectionTitle>
        <Rule title="Alcohol y sustancias">
          <ul className="list-disc list-inside space-y-1.5">
            <li>El consumo debe ser <strong className="text-text-primary">moderado</strong></li>
            <li>No se permite jugar bajo estados de intoxicación que afecten el comportamiento, el ritmo de juego o la convivencia</li>
            <li>El comité podrá solicitar que un jugador excesivamente intoxicado abandone la mesa, <strong className="text-accent-light">sin derecho a reclamo</strong></li>
          </ul>
        </Rule>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Juego y Ambiente</SectionTitle>
        <Rule title="Ritmo de juego">
          Los jugadores deben mantener un ritmo de juego razonable y respetar las decisiones de la mesa y de la organización.
        </Rule>
        <Callout variant="blue">
          Cualquier conflicto será resuelto por el Comité de Gordos de Traje, cuya decisión será final.
        </Callout>
      </SectionCard>
    </motion.div>
  )
}
