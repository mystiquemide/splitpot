import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-gray-800 py-10">
      <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="text-center sm:text-left space-y-1">
          <p className="text-gray-300 font-medium">Splitpot</p>
          <p>
            Matchday pots ·{" "}
            <a
              href="https://wdk.tether.io"
              className="text-emerald-500 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Tether WDK
            </a>{" "}
            · Apache 2.0
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/app" className="hover:text-white">
            App
          </Link>
          <a
            href="https://github.com/mystiquemide/splitpot"
            className="hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
