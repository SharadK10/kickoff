import { Link, useLoaderData } from 'react-router-dom'
import { KickoffTheme } from '../../core/theme/KickoffTheme'
import type { Kickoff } from '../../types/content'

export function KickoffRoute() {
  const kickoff = useLoaderData() as Kickoff

  return (
    <KickoffTheme accent={kickoff.accent}>
      <header className="pt-6 sm:pt-16">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">{kickoff.category}</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-ink sm:text-8xl">{kickoff.title}</h1>
        <p className="mt-5 max-w-[40ch] text-xl text-ink-muted sm:text-2xl">{kickoff.tagline}</p>
      </header>

      <ul className="mt-16 border-t border-line sm:mt-24">
        {kickoff.exercises.map((exercise) =>
          exercise.status === 'LIVE' ? (
            <li key={exercise.slug} className="border-b border-line">
              <Link
                to={`/${kickoff.slug}/${exercise.slug}`}
                className="group flex flex-col gap-2 py-8 transition-colors sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="font-display text-sm text-ink-faint sm:w-8">{exercise.number}</span>
                <span className="font-display text-3xl text-ink transition-colors group-hover:text-accent sm:text-4xl">
                  {exercise.title}
                </span>
                <span
                  aria-hidden="true"
                  className="text-base text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-accent sm:ml-auto"
                >
                  →
                </span>
              </Link>
            </li>
          ) : (
            <li
              key={exercise.slug}
              className="flex flex-col gap-2 border-b border-line py-8 opacity-60 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="font-display text-sm text-ink-faint sm:w-8">{exercise.number}</span>
              <span className="font-display text-3xl text-ink-faint sm:text-4xl">{exercise.title}</span>
              {exercise.description ? (
                <span className="max-w-[40ch] text-ink-faint">{exercise.description}</span>
              ) : null}
              <span className="text-xs uppercase tracking-[0.16em] text-ink-faint sm:ml-auto">Soon</span>
            </li>
          ),
        )}
      </ul>

      <p className="mt-12 max-w-[46ch] text-ink-muted">{kickoff.closing}</p>
    </KickoffTheme>
  )
}
