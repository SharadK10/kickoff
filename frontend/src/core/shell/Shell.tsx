import { Link, Outlet } from 'react-router-dom'

export function Shell() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-7 sm:px-10 sm:py-9">
          <Link to="/" className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-accent px-2.5 font-display text-xl tracking-tight text-surface sm:h-12 sm:px-3 sm:text-2xl"
            >
              KO
            </span>
            <span className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Kick Off</span>
          </Link>
          <p className="font-display text-base italic text-ink-faint sm:text-lg">
            Fundamentals first. Then it&rsquo;s a playground.
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16 sm:px-10">
        <Outlet />
      </main>
      <footer className="border-t border-line px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 text-xs text-ink-faint">
          <span>powered by</span>
          <img src="/liv2code_logo.png" alt="liv2code" className="h-5 w-auto" />
        </div>
      </footer>
    </div>
  )
}
