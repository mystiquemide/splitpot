import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    n: "01",
    title: "Create your wallet",
    body: "One tap generates a self-custodial WDK wallet. You hold the seed. We never see it.",
  },
  {
    n: "02",
    title: "Open a matchday pot",
    body: "Pick a fixture, set an equal stake, lock your pick with a real wallet signature.",
  },
  {
    n: "03",
    title: "Friends join and settle",
    body: "Share the pot. Everyone signs their pick. Host settles full time. Winners split the pool.",
  },
]

const perks = [
  {
    title: "You keep the keys",
    body: "Built on Tether WDK. No custodian holds funds or signs for you.",
  },
  {
    title: "Real signatures",
    body: "Every join is a verified personal_sign. No fake checkboxes.",
  },
  {
    title: "Watch-party simple",
    body: "Equal stakes, clear picks, payout plan. Like Venmo pots, without the trust issues.",
  },
  {
    title: "Works in the browser",
    body: "No app store. Create a wallet, open a pot, share a link.",
  },
]

export function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.18), transparent), radial-gradient(ellipse 40% 30% at 90% 20%, rgba(52,211,153,0.08), transparent)",
        }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Matchday pots · self-custodial
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
              Split the pot.
              <br />
              <span className="text-emerald-400">Keep your keys.</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              The watch-party prediction pot your friends will actually use.
              Equal stakes, signed picks, fair split after full time. Powered by
              Tether&apos;s Wallet Development Kit.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/app">
                <Button size="lg" className="rounded-full px-8">
                  Open app
                </Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  How it works
                </Button>
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Free · Apache 2.0 · No cloud AI · Keys stay on your device
            </p>
          </div>

          {/* Product preview card */}
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900/90 to-gray-950 p-1 shadow-2xl shadow-emerald-950/40">
            <div className="rounded-[14px] border border-gray-800 bg-gray-950 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-400 uppercase tracking-wide">Live pot</p>
                  <p className="text-lg font-semibold text-white">Final watch-party</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">
                  open
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                England <span className="text-gray-500 font-normal text-lg">vs</span> Spain
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Pool", v: "40 USDt" },
                  { label: "Players", v: "4" },
                  { label: "Stake", v: "10 each" },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-gray-800 bg-gray-900/60 py-3"
                  >
                    <p className="text-[10px] uppercase text-gray-500">{c.label}</p>
                    <p className="text-sm font-semibold text-white">{c.v}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { name: "You", pick: "England", ok: true },
                  { name: "Maya", pick: "Spain", ok: true },
                  { name: "Jordan", pick: "Draw", ok: true },
                ].map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between rounded-lg border border-gray-800/80 px-3 py-2 text-sm"
                  >
                    <span className="text-gray-200">{r.name}</span>
                    <span className="text-gray-400">{r.pick}</span>
                    <span className="text-emerald-400 text-xs">signed ✓</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-200/90">
                Each pick locked with a verified WDK signature
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-gray-800/80 bg-gray-900/30">
        <div className="mx-auto max-w-5xl px-4 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-400">
          <span>Self-custodial</span>
          <span className="hidden sm:inline text-gray-700">·</span>
          <span>Tether WDK</span>
          <span className="hidden sm:inline text-gray-700">·</span>
          <span>Verified signatures</span>
          <span className="hidden sm:inline text-gray-700">·</span>
          <span>Football-first</span>
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-5xl px-4 py-20">
        <div className="mb-10 max-w-lg">
          <p className="text-sm font-medium text-emerald-400 mb-2">How it works</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Three steps. Done before kickoff.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 hover:border-gray-700 transition-colors"
            >
              <p className="text-sm font-mono text-emerald-500 mb-3">{s.n}</p>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section id="why" className="mx-auto max-w-5xl px-4 pb-20">
        <div className="mb-10">
          <p className="text-sm font-medium text-emerald-400 mb-2">Why Splitpot</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Built for real groups, not theater.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {perks.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-950 p-6"
            >
              <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/50 via-gray-950 to-gray-950 px-8 py-12 sm:px-12 text-center">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.25), transparent 55%)",
            }}
          />
          <div className="relative space-y-4">
            <h2 className="text-3xl font-bold text-white">Ready for matchday?</h2>
            <p className="text-gray-300 max-w-md mx-auto">
              Create a wallet, open a pot, invite the group. Under a minute to first pot.
            </p>
            <Link href="/app">
              <Button size="lg" className="rounded-full px-10 mt-2">
                Launch Splitpot
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
