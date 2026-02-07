import { motion } from 'framer-motion'
import { GlassCard, PageHeader } from '../components/ui'
import { fadeIn, staggerContainer, staggerItem } from '../lib/motion'

export function HistoriaPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <PageHeader title="Historia de La Granja" />

      {/* Manifiesto */}
      <motion.div variants={fadeIn} initial="initial" animate="animate">
        <GlassCard as="section" className="p-6">
          <h2 className="text-xl font-medium text-accent mb-4">El Manifiesto</h2>
          <div className="text-text-secondary space-y-4">
            <p>
              <em className="text-text-primary">"No tratés de entenderla, disfrutála"</em>
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
            <p className="text-text-tertiary italic">
              (Contenido por completar...)
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Galería de fotos */}
      <motion.section variants={fadeIn} initial="initial" whileInView="animate" viewport={{ once: true }}>
        <h2 className="text-xl font-medium mb-4">Galería</h2>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div key={i} variants={staggerItem}>
              <GlassCard className="aspect-square flex items-center justify-center text-text-tertiary">
                Foto {i}
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
        <p className="text-text-tertiary text-sm mt-4 text-center">
          (Fotos por agregar)
        </p>
      </motion.section>
    </div>
  )
}
