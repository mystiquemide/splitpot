import Link from "next/link"

export function Nav() {
  return (
    <nav className="w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="text-base font-bold text-white tracking-tight">
          Splitpot
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="hidden sm:inline text-emerald-500/90">WDK · self-custody</span>
          <Link href="/" className="hover:text-white">
            Home
          </Link>
        </div>
      </div>
    </nav>
  )
}
