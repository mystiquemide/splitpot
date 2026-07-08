import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t-2 border-black mt-auto">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 grid gap-6 sm:grid-cols-3 items-start">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black">
            Splitpot
          </p>
          <p className="font-display text-2xl text-black leading-none">
            Matchday pots, self-custodial.
          </p>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 space-y-1 sm:text-center">
          <p>
            <a
              href="https://wdk.tether.io"
              className="text-black underline decoration-1 underline-offset-4 hover:decoration-2"
              target="_blank"
              rel="noreferrer"
            >
              Tether WDK
            </a>
          </p>
          <p>Apache 2.0</p>
        </div>
        <div className="flex sm:justify-end gap-6 font-mono text-[11px] uppercase tracking-wider">
          <Link href="/docs" className="text-neutral-600 hover:text-black">
            Docs
          </Link>
          <Link href="/app" className="text-neutral-600 hover:text-black">
            App
          </Link>
          <a
            href="https://github.com/mystiquemide/splitpot"
            className="text-neutral-600 hover:text-black"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-black">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          Keys stay on your device · No cloud AI
        </div>
      </div>
    </footer>
  )
}
