import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Nav() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b-2 border-black bg-[#fafafa]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black"
        >
          Splitpot
        </Link>
        <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider">
          <Link href="/#how" className="hidden sm:inline text-neutral-600 hover:text-black">
            How it works
          </Link>
          <Link href="/#why" className="hidden sm:inline text-neutral-600 hover:text-black">
            Why
          </Link>
          <Link href="/app">
            <Button size="sm">Start a pot</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
