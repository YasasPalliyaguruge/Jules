import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-20 w-full border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
          Jules
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-3 text-sm font-semibold text-slate-600 sm:gap-6">
            <li>
              <Link href="/#check-in" className="transition hover:text-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100">
                Check in
              </Link>
            </li>
            <li>
              <Link href="/#history" className="transition hover:text-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100">
                History
              </Link>
            </li>
            <li className="hidden sm:block">
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-800">Stored locally</span>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
