import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mt-24 border-t border-line pt-10 sm:mt-32 sm:pt-12"
    >
      <h2 className="mb-10 text-xs uppercase tracking-[0.18em] text-ink-faint sm:mb-14">{title}</h2>
      {children}
    </motion.section>
  )
}
