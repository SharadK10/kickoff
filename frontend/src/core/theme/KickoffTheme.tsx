import type { ReactNode } from 'react'

/**
 * A kickoff's only visual liberty at the page level: it sets the accent every
 * core component already reads. Core fixes the type scale and spacing rhythm.
 */
export function KickoffTheme({ accent, children }: { accent: string; children: ReactNode }) {
  return <div style={{ ['--color-accent' as string]: accent }}>{children}</div>
}
