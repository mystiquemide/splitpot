import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    n: "01",
    title: "Create your wallet",
    body: "Generate a self-custodial WDK wallet. You hold the seed. We never see it.",
  },
  {
    n: "02",
    title: "Open a matchday pot",
    body: "Pick a fixture, set an equal stake, lock your pick with a real wallet signature.",
  },
  {
    n: "03",
    title: "Join, settle, split",
    body: "Share the pot. Everyone signs. Host settles full time. Winners take the pool.",
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
    body: "Equal stakes, clear picks, payout plan. Cash-pot rules, honest rails.",
  },
  {
    title: "Browser native",
    body: "No app store. Create a wallet, open a pot, share a link.",
  },
]

export function LandingPage() {
  return (
    <div className="bg-[#fafafa]">
      {/* Masthead */}
      <div className="border-b-2 border-black">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
          <span>Edition 01</span>
          <span className="hidden sm:inline">Self-custodial matchday finance</span>
          <span>WDK · USDt</span>
        </div>
      </div>

      {/* Hero — newspaper spread */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            <p className="stamp">Matchday pots · self-custodial</p>
            <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] tracking-tight text-black">
              Split the pot.
              <br />
              <em className="not-italic border-b-4 border-black">Keep your keys.</em>
            </h1>
            <p className="max-w-md text-base sm:text-lg text-neutral-600 leading-relaxed border-l-2 border-black pl-4">
              The watch-party prediction pot your friends will actually use.
              Equal stakes, signed picks, fair split after full time. Powered by
              Tether&apos;s Wallet Development Kit.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/app">
                <Button size="lg">Open app →</Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline">
                  Process
                </Button>
              </a>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
              Free · Apache 2.0 · No cloud AI · Keys stay on device
            </p>
          </div>

          {/* Proof card — product preview */}
          <div className="lg:col-span-5">
            <div className="proof-card p-0 overflow-hidden">
              <div className="border-b-2 border-black px-4 py-2 flex items-center justify-between bg-neutral-100">
                <span className="font-mono text-[10px] uppercase tracking-widest">
                  Live pot · specimen
                </span>
                <span className="stamp">Open</span>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                    Final watch-party
                  </p>
                  <p className="font-display text-3xl text-black leading-none">
                    England <span className="text-neutral-400 text-xl">vs</span> Spain
                  </p>
                </div>
                <div className="grid grid-cols-3 border-2 border-black">
                  {[
                    { label: "Pool", v: "40 USDt" },
                    { label: "Players", v: "4" },
                    { label: "Stake", v: "10 ea" },
                  ].map((c, i) => (
                    <div
                      key={c.label}
                      className={`py-3 px-2 text-center ${i < 2 ? "border-r-2 border-black" : ""}`}
                    >
                      <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                        {c.label}
                      </p>
                      <p className="font-mono text-sm font-medium text-black mt-1">{c.v}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-0 border-2 border-black divide-y-2 divide-black">
                  {[
                    { name: "You", pick: "England" },
                    { name: "Maya", pick: "Spain" },
                    { name: "Jordan", pick: "Draw" },
                  ].map((r) => (
                    <div
                      key={r.name}
                      className="flex items-center justify-between px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-black">{r.name}</span>
                      <span className="font-mono text-xs text-neutral-600">{r.pick}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-black">
                        signed
                      </span>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 border-t border-dashed border-neutral-400 pt-3">
                  Each pick locked with a verified WDK signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip — classified bar */}
      <section className="border-y-2 border-black bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span>Self-custodial</span>
          <span className="hidden sm:inline opacity-40">/</span>
          <span>Tether WDK</span>
          <span className="hidden sm:inline opacity-40">/</span>
          <span>Verified signatures</span>
          <span className="hidden sm:inline opacity-40">/</span>
          <span>Football-first</span>
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="mb-12 border-b-2 border-black pb-6 grid sm:grid-cols-12 gap-4">
          <p className="sm:col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Process
          </p>
          <h2 className="sm:col-span-9 font-display text-4xl sm:text-5xl text-black leading-[1.05]">
            Three steps.
            <br />
            Done before kickoff.
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-3 border-2 border-black">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`p-6 bg-white ${i < 2 ? "md:border-r-2 border-black border-b-2 md:border-b-0" : ""} ${i < 2 ? "border-b-2 md:border-b-0" : ""}`}
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                {s.n}
              </p>
              <h3 className="font-display text-2xl text-black mb-3 leading-tight">
                {s.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof / why */}
      <section id="why" className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <div className="mb-12 border-b-2 border-black pb-6 grid sm:grid-cols-12 gap-4">
          <p className="sm:col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Proof
          </p>
          <h2 className="sm:col-span-9 font-display text-4xl sm:text-5xl text-black leading-[1.05]">
            Built for real groups,
            <br />
            not theater.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {perks.map((p) => (
            <div key={p.title} className="proof-card-flat p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-3">
                Spec
              </p>
              <h3 className="font-display text-2xl text-black mb-2 leading-tight">
                {p.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="border-2 border-black bg-black text-white px-8 py-14 sm:px-12 text-center shadow-[8px_8px_0_0_#0a0a0a]">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-4">
            Call to action
          </p>
          <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
            Ready for matchday?
          </h2>
          <p className="text-neutral-400 max-w-md mx-auto mb-8 text-sm sm:text-base">
            Create a wallet, open a pot, invite the group. Under a minute to first pot.
          </p>
          <Link href="/app">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-neutral-100 border-white shadow-[3px_3px_0_0_#a3a3a3]"
            >
              Launch Splitpot →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
