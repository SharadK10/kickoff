import { useLoaderData } from 'react-router-dom'
import { BlockRenderer } from '../../core/blocks'
import { Playground } from '../../core/playground/Playground'
import { KickoffTheme } from '../../core/theme/KickoffTheme'
import { Section } from '../../core/ui/Section'
import type { Kickoff } from '../../types/content'

export function KickoffRoute() {
  const kickoff = useLoaderData() as Kickoff

  return (
    <KickoffTheme accent={kickoff.accent}>
      <header className="pt-6 sm:pt-16">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">{kickoff.category}</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-ink sm:text-8xl">{kickoff.title}</h1>
        <p className="mt-5 max-w-[40ch] text-xl text-ink-muted sm:text-2xl">{kickoff.tagline}</p>
        <p className="mt-10 text-sm text-ink-faint">
          <span className="text-accent">{kickoff.exerciseNumber}</span>
          <span className="mx-2">·</span>
          {kickoff.exerciseTitle}
        </p>
      </header>

      <Section title="The Idea">
        <div className="flex flex-col items-start gap-12">
          <BlockRenderer blocks={kickoff.idea} />
        </div>
      </Section>

      <Section title="The Playground">
        <Playground config={kickoff.playground} />
      </Section>

      <Section title="What's Next">
        <ul className="border-t border-line">
          {kickoff.whatsNext.map((item) => (
            <li key={item.number} className="flex gap-6 border-b border-line py-7">
              <span className="font-display text-2xl text-ink-faint">{item.number}</span>
              <div className="min-w-0">
                <p className="text-lg text-ink">{item.title}</p>
                <p className="mt-1 max-w-[54ch] text-ink-muted">{item.description}</p>
              </div>
              <span className="ml-auto self-start text-xs uppercase tracking-[0.16em] text-ink-faint">Soon</span>
            </li>
          ))}
        </ul>
        <p className="mt-12 max-w-[46ch] text-ink-muted">
          And when you have this — go and play a real piano. Kick Off is for starting, not for staying.
        </p>
      </Section>
    </KickoffTheme>
  )
}
