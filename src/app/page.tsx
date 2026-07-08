"use client"

import Link from "next/link"
import { WalletBar, useWallet } from "@/components/wallet-bar"
import { CreatePotForm } from "@/components/create-pot-form"
import { loadPots } from "@/lib/store"
import { shortAddr, totalPool } from "@/lib/pot"
import { useEffect, useState } from "react"
import type { Pot } from "@/lib/types"

export default function Home() {
  const wallet = useWallet()
  const [pots, setPots] = useState<Pot[]>([])

  useEffect(() => {
    setPots(loadPots())
    const id = setInterval(() => setPots(loadPots()), 1500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium text-emerald-400">Tether Developers Cup · WDK track</p>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Splitpot
        </h1>
        <p className="text-lg text-gray-300 max-w-xl">
          Matchday prediction pot for friends. Equal stake, lock picks, settle full time,
          split the pool. Self-custodial with{" "}
          <span className="text-emerald-400">Tether WDK</span>. No custodian. No chatbot.
        </p>
      </header>

      <WalletBar />

      {wallet ? (
        <CreatePotForm wallet={wallet} />
      ) : (
        <div className="rounded-xl border border-dashed border-gray-700 p-6 text-sm text-gray-400">
          Create a WDK wallet above to open a pot.
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Your pots (this browser)</h2>
        {pots.length === 0 ? (
          <p className="text-sm text-gray-500">No pots yet.</p>
        ) : (
          <ul className="space-y-2">
            {pots.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pot/${p.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-800 bg-gray-900/40 px-4 py-3 hover:border-emerald-800"
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

      <section className="rounded-xl border border-gray-800 p-5 text-sm text-gray-400 space-y-2">
        <h3 className="font-medium text-gray-200">How it works</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create a self-custodial WDK wallet (seed in session only).</li>
          <li>Open a pot for a match. Stake is equal for everyone.</li>
          <li>Friends join with their own WDK wallets and lock a pick (signed).</li>
          <li>Host settles the result. Winners split the pool. Pay peer-to-peer USDt.</li>
        </ol>
      </section>
    </div>
  )
}
