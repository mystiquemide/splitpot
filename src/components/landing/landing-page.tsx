import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    n: "1",
    title: "Make a wallet",
    body: "Create a self-custodial wallet in your browser. You keep the seed phrase. Splitpot never sees it.",
  },
  {
    n: "2",
    title: "Start a pot",
    body: "Pick a match, set one stake for everyone, lock your pick by signing with your wallet.",
  },
  {
    n: "3",
    title: "Settle and pay",
    body: "Friends join with a link. After full time, the host records the result and winners get the pool.",
  },
]

const reasons = [
  {
    title: "You hold the keys",
    body: "Wallets run on Tether’s WDK. No company account holds your funds or signs for you.",
  },
  {
    title: "Real wallet signatures",
    body: "Every pick is signed and checked on your device. No checkbox pretending to be a signature.",
  },
  {
    title: "Rules everyone already knows",
    body: "Equal stakes, one pick each, winners split the pot. Same as a cash pot, without the trust problem.",
  },
  {
    title: "Works in the browser",
    body: "No app store install. Create a wallet, open a pot, send the link to the group.",
  },
]

export function LandingPage() {
  return (
    <div className="bg-[#fafafa]">
      <div className="border-b-2 border-black">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
          <span>Matchday pots</span>
          <span className="hidden sm:inline">Self-custodial · WDK</span>
          <span>Apache 2.0</span>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            <p className="stamp">Prediction pots for watch parties</p>
            <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] tracking-tight text-black">
              Split the pot.
              <br />
              <em className="not-italic border-b-4 border-black">Keep your keys.</em>
            </h1>
            <p className="max-w-md text-base sm:text-lg text-neutral-600 leading-relaxed border-l-2 border-black pl-4">
              Friends put in the same stake, pick a result, and split the pool when the match ends.
              Each person signs with their own wallet. Optional on-chain USDt for deposits and payouts.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/app">
                <Button size="lg">Start a pot</Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline">
                  How it works
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="proof-card p-0 overflow-hidden">
              <div className="border-b-2 border-black px-4 py-2 bg-neutral-100">
                <span className="font-mono text-[10px] uppercase tracking-widest">
                  What you get
                </span>
              </div>
              <div className="p-5 space-y-0 divide-y-2 divide-black border-b-2 border-black">
                {[
                  {
                    k: "Equal stakes",
                    v: "Everyone puts in the same amount. No uneven side pots.",
                  },
                  {
                    k: "Signed picks",
                    v: "Your pick is locked to your wallet address with a real signature.",
                  },
                  {
                    k: "Fair split",
                    v: "Correct picks share the pool evenly after the host settles.",
                  },
                  {
                    k: "Optional USDt",
                    v: "Turn on on-chain mode to send stake and pay winners with WDK.",
                  },
                ].map((row) => (
                  <div key={row.k} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                      {row.k}
                    </p>
                    <p className="text-sm text-black leading-relaxed">{row.v}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-white">
                <Link
                  href="/app"
                  className="font-mono text-[11px] uppercase tracking-wider text-black underline underline-offset-4"
                >
                  Open the app to create one →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-black bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span>Self-custodial</span>
          <span className="hidden sm:inline opacity-40">/</span>
          <span>Tether WDK</span>
          <span className="hidden sm:inline opacity-40">/</span>
          <span>Verified signatures</span>
          <span className="hidden sm:inline opacity-40">/</span>
          <span>Football matchday</span>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
        <div className="mb-12 border-b-2 border-black pb-6 grid sm:grid-cols-12 gap-4">
          <p className="sm:col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            How it works
          </p>
          <h2 className="sm:col-span-9 font-display text-4xl sm:text-5xl text-black leading-[1.05]">
            Three steps before kickoff.
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-3 border-2 border-black">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`p-6 bg-white ${
                i < 2 ? "border-b-2 md:border-b-0 md:border-r-2 border-black" : ""
              }`}
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                Step {s.n}
              </p>
              <h3 className="font-display text-2xl text-black mb-3 leading-tight">{s.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <div className="mb-12 border-b-2 border-black pb-6 grid sm:grid-cols-12 gap-4">
          <p className="sm:col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Why Splitpot
          </p>
          <h2 className="sm:col-span-9 font-display text-4xl sm:text-5xl text-black leading-[1.05]">
            Built for groups that already run pots.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {reasons.map((p) => (
            <div key={p.title} className="proof-card-flat p-6">
              <h3 className="font-display text-2xl text-black mb-2 leading-tight">{p.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="border-2 border-black bg-black text-white px-8 py-14 sm:px-12 text-center shadow-[8px_8px_0_0_#0a0a0a]">
          <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
            Ready for matchday?
          </h2>
          <p className="text-neutral-400 max-w-md mx-auto mb-8 text-sm sm:text-base">
            Create your wallet, open a pot, and send the share link to your group.
          </p>
          <Link href="/app">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-neutral-100 border-white shadow-[3px_3px_0_0_#a3a3a3]"
            >
              Start a pot
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
