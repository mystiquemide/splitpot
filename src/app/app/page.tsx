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
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-emerald-400">App</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Your pots</h1>
        <p className="text-gray-400">
          Create a self-custodial wallet, open a matchday pot, and lock picks with a real WDK signature.
        </p>
      </header>

      <WalletBar />

      {wallet ? (
        <CreatePotForm wallet={wallet} />
      ) : (
        <div className="rounded-xl border border-dashed border-gray-700 p-6 text-sm text-gray-400">
          Create or import a WDK wallet above to open a pot.
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Recent pots</h2>
        {pots.length === 0 ? (
          <p className="text-sm text-gray-500">No pots yet. Create one after your wallet is ready.</p>
        ) : (
          <ul className="space-y-2">
            {pots.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pot/${p.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-800 bg-gray-900/40 px-4 py-3 hover:border-emerald-800 transition-colors"
                >
                  <div>
                    <div className="font-medium text-white">{p.title}</div>
                    <div className="text-sm text-gray-400">
                      {p.homeTeam} vs {p.awayTeam} · {p.participants.length} players ·{" "}
                      {totalPool(p)} {p.currency}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div className="uppercase text-emerald-500">{p.status}</div>
                    <div>{shortAddr(p.hostAddress)}</div>
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
