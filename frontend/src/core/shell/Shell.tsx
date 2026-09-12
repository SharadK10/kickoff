import { Link, Outlet } from 'react-router-dom'

export function Shell() {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex max-w-5xl items-center px-6 py-7 sm:px-10">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          Kick Off
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-32 sm:px-10">
        <Outlet />
      </main>
    </div>
  )
}
