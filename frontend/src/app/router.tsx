import type { LoaderFunctionArgs, RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '../core/shell/Shell'
import { loadKickoff, loadShelf } from '../services/contentSource'
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
    ],
  },
]

export const router = createBrowserRouter(routes)
