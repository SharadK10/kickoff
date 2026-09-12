import { Link, useLoaderData } from 'react-router-dom'
import type { KickoffSummary } from '../../types/content'

export function HomeRoute() {
  const shelf = useLoaderData() as KickoffSummary[]

  return (
    <div className="pt-14 sm:pt-28">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Start something</p>
      <h1 className="mt-4 max-w-[16ch] font-display text-5xl leading-[1.05] text-ink sm:text-7xl">
        What do you want to start?
      </h1>
      <p className="mt-6 max-w-[46ch] text-lg text-ink-muted sm:text-xl">
        Pick one thing. Get the fundamental down — that&rsquo;s the only part that takes discipline. Everything
        after is a <span className="text-accent">playground</span>.
      </p>

      <ul className="mt-16 border-t border-line sm:mt-24">
        {shelf.map((kickoff, index) => (
          <li key={kickoff.slug} className="border-b border-line">
            <Link
              to={`/${kickoff.slug}`}
              className="group flex flex-col gap-2 py-9 transition-colors sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span className="font-display text-sm text-ink-faint sm:w-8">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-4xl text-ink transition-colors group-hover:text-accent sm:text-5xl">
                {kickoff.title}
              </span>
              <span className="text-lg text-ink-muted">{kickoff.tagline}</span>
              <span className="flex items-center gap-5 text-xs uppercase tracking-[0.16em] text-ink-faint sm:ml-auto">
                {kickoff.category}
                <span
                  aria-hidden="true"
                  className="text-base normal-case tracking-normal transition-transform group-hover:translate-x-1 group-hover:text-accent"
                >
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
