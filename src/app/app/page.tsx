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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const tick = () => setPots(loadPots())
    const t = window.setTimeout(() => {
      tick()
      setReady(true)
    }, 0)
    const id = window.setInterval(tick, 1500)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(id)
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-10">
      <header className="space-y-3 border-b-2 border-black pb-8">
        <h1 className="font-display text-4xl sm:text-5xl text-black leading-none">
          Your matchday pots
        </h1>
        <p className="text-neutral-600 max-w-lg text-sm sm:text-base leading-relaxed">
          {wallet
            ? "Create a pot, share the link, lock picks after everyone joins, then settle when the match ends."
            : "First, create or import a wallet. You keep the seed on this device."}
        </p>
      </header>

      <WalletBar />

      {wallet && <CreatePotForm wallet={wallet} />}

      {ready && (
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b-2 border-black pb-3">
            <h2 className="font-display text-2xl text-black">Your pots</h2>
            {pots.length > 0 && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                {pots.length}
              </span>
            )}
          </div>
          {pots.length === 0 ? (
            <div className="proof-card-flat p-6 space-y-2">
              <p className="text-sm text-black">No pots yet.</p>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {wallet
                  ? "Fill in a match above, sign your pick, and you’ll land on the pot page with a share link."
                  : "Create a wallet first, then you can open a pot for your group."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {pots.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/pot/${p.id}`}
                    className="proof-card-flat flex flex-wrap items-center justify-between gap-2 px-4 py-4 hover:bg-neutral-50"
                  >
                    <div>
                      <div className="font-display text-xl text-black leading-tight">
                        {p.title}
                      </div>
                      <div className="font-mono text-[11px] text-neutral-500 mt-1 uppercase tracking-wide">
                        {p.homeTeam} vs {p.awayTeam} · {p.participants.length}{" "}
                        {p.participants.length === 1 ? "player" : "players"} ·{" "}
                        {totalPool(p)} {p.currency}
                        {p.onChain ? " · on-chain" : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="stamp">{p.status}</span>
                      <div className="font-mono text-[10px] text-neutral-500 mt-2">
                        host {shortAddr(p.hostAddress)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
