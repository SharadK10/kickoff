import { Link, useLoaderData } from 'react-router-dom'
import { BlockRenderer } from '../../core/blocks'
import { PlaygroundHost } from '../../core/playground'
import { KickoffTheme } from '../../core/theme/KickoffTheme'
import { Section } from '../../core/ui/Section'
import type { Exercise, Kickoff } from '../../types/content'

export type ExerciseLoaderData = { kickoff: Kickoff; exercise: Exercise }

export function ExerciseRoute() {
  const { kickoff, exercise } = useLoaderData() as ExerciseLoaderData

  return (
    <KickoffTheme accent={kickoff.accent}>
      <header className="pt-6 sm:pt-16">
        <Link to={`/${kickoff.slug}`} className="text-sm text-ink-faint transition-colors hover:text-ink">
          ← {kickoff.title}
        </Link>
        <p className="mt-6 text-sm text-ink-faint">
          <span className="text-accent">{exercise.number}</span>
          <span className="mx-2">·</span>
          {exercise.title}
        </p>
      </header>

      <Section title="The Idea">
        <div className="flex flex-col items-start gap-12">
          <BlockRenderer blocks={exercise.idea ?? []} />
        </div>
      </Section>

      <Section title="The Playground">
        {exercise.playgroundType && exercise.playground ? (
          <PlaygroundHost type={exercise.playgroundType} config={exercise.playground} />
        ) : null}
      </Section>
    </KickoffTheme>
  )
}
