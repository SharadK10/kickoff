import { Link, useLoaderData } from 'react-router-dom'
import type { KickoffSummary } from '../../types/content'

export function HomeRoute() {
  const shelf = useLoaderData() as KickoffSummary[]

  return (
    <div className="pt-10 sm:pt-24">
      <h1 className="max-w-[16ch] font-display text-5xl leading-[1.05] text-ink sm:text-7xl">
        What do you want to start?
      </h1>
      <p className="mt-6 max-w-[46ch] text-lg text-ink-muted sm:text-xl">
        Pick one thing. Learn the idea that unlocks it, mess around until it sticks, then go and do it for real.
      </p>

      <ul className="mt-16 border-t border-line sm:mt-24">
        {shelf.map((kickoff) => (
          <li key={kickoff.slug} className="border-b border-line">
            <Link
              to={`/${kickoff.slug}`}
              className="group flex flex-col gap-2 py-8 transition-colors sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span className="font-display text-4xl text-ink transition-colors group-hover:text-accent sm:text-5xl">
                {kickoff.title}
              </span>
              <span className="text-lg text-ink-muted">{kickoff.tagline}</span>
              <span className="text-xs uppercase tracking-[0.16em] text-ink-faint sm:ml-auto">
                {kickoff.category}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
