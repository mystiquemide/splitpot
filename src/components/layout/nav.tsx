import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Nav() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-base font-bold text-white tracking-tight">
          Splitpot
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/#how" className="hidden sm:inline text-gray-400 hover:text-white">
            How it works
          </Link>
          <Link href="/#why" className="hidden sm:inline text-gray-400 hover:text-white">
            Why
          </Link>
          <Link href="/app">
            <Button size="sm" className="rounded-full">
              Open app
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
