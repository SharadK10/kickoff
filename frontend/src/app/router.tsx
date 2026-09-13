import type { LoaderFunctionArgs, RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '../core/shell/Shell'
import { loadKickoff, loadShelf } from '../services/contentSource'
import { ExerciseRoute } from './routes/ExerciseRoute'
import { HomeRoute } from './routes/HomeRoute'
import { KickoffRoute } from './routes/KickoffRoute'
import { RouteError } from './routes/RouteError'

export const routes: RouteObject[] = [
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomeRoute />, loader: () => loadShelf(), errorElement: <RouteError /> },
      {
        path: '/:slug',
        element: <KickoffRoute />,
        loader: ({ params }: LoaderFunctionArgs) => loadKickoff(params.slug as string),
        errorElement: <RouteError />,
      },
      {
        path: '/:slug/:exerciseSlug',
        element: <ExerciseRoute />,
        loader: async ({ params }: LoaderFunctionArgs) => {
          const kickoff = await loadKickoff(params.slug as string)
          const exercise = kickoff.exercises.find(
            (candidate) => candidate.slug === params.exerciseSlug && candidate.status === 'LIVE',
          )
          if (!exercise) {
            throw new Error(`Could not find exercise "${params.exerciseSlug}" in ${params.slug}.`)
          }
          return { kickoff, exercise }
        },
        errorElement: <RouteError />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
