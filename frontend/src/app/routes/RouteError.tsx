import { Link, useRouteError } from 'react-router-dom'

export function RouteError() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : 'Something went wrong on our side.'

  return (
    <div className="pt-16 sm:pt-28">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">That didn't load.</h1>
      <p className="mt-4 max-w-[48ch] text-lg text-ink-muted">{message}</p>
      <Link to="/" className="mt-10 inline-block border-b border-ink pb-0.5 text-ink">
        Back to the start
      </Link>
    </div>
  )
}
