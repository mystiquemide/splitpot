"use client"

import Link from "next/link"
import { WalletBar, useWallet } from "@/components/wallet-bar"
import { CreatePotForm } from "@/components/create-pot-form"
import { loadPots } from "@/lib/store"
import { shortAddr, totalPool } from "@/lib/pot"
import { useEffect, useState } from "react"
import type { Pot } from "@/lib/types"

export default function AppPage() {
  const wallet = useWallet()
  const [pots, setPots] = useState<Pot[]>([])

  useEffect(() => {
    const tick = () => setPots(loadPots())
    const t = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 1500)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(id)
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-10">
      <header className="space-y-3 border-b-2 border-black pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Application
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-black leading-none">
          Your pots
        </h1>
        <p className="text-neutral-600 max-w-lg text-sm sm:text-base leading-relaxed">
          Create a self-custodial wallet, open a matchday pot, and lock picks with a real WDK
          signature.
        </p>
      </header>

      <WalletBar />

      {wallet ? (
        <CreatePotForm wallet={wallet} />
      ) : (
        <div className="border-2 border-dashed border-black p-6 font-mono text-xs uppercase tracking-wider text-neutral-500">
          Create or import a WDK wallet above to open a pot.
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between border-b-2 border-black pb-3">
          <h2 className="font-display text-2xl text-black">Recent pots</h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            {pots.length} total
          </span>
        </div>
        {pots.length === 0 ? (
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            No pots yet. Create one after your wallet is ready.
          </p>
        ) : (
          <ul className="space-y-3">
            {pots.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pot/${p.id}`}
                  className="proof-card-flat flex flex-wrap items-center justify-between gap-2 px-4 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div>
                    <div className="font-display text-xl text-black leading-tight">{p.title}</div>
                    <div className="font-mono text-[11px] text-neutral-500 mt-1 uppercase tracking-wide">
                      {p.homeTeam} vs {p.awayTeam} · {p.participants.length} players ·{" "}
                      {totalPool(p)} {p.currency}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="stamp">{p.status}</span>
                    <div className="font-mono text-[10px] text-neutral-500 mt-2">
                      {shortAddr(p.hostAddress)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
