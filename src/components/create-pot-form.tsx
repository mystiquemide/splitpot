"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createPotId, sampleMatches } from "@/lib/pot"
import { savePot } from "@/lib/store"
import type { LocalWallet, Pot } from "@/lib/types"
import { buildJoinMessage, signJoinMessage } from "@/lib/wdk-client"

export function CreatePotForm({ wallet }: { wallet: LocalWallet }) {
  const router = useRouter()
  const samples = sampleMatches()
  const [homeTeam, setHomeTeam] = useState<string>(samples[0].homeTeam)
  const [awayTeam, setAwayTeam] = useState<string>(samples[0].awayTeam)
  const [title, setTitle] = useState<string>(samples[0].title)
  const [stake, setStake] = useState(10)
  const [hostPick, setHostPick] = useState<"home" | "away" | "draw">("home")
  const [hostName, setHostName] = useState("Host")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function applySample(i: number) {
    const s = samples[i]
    setHomeTeam(s.homeTeam)
    setAwayTeam(s.awayTeam)
    setTitle(s.title)
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const id = createPotId()
      const msg = buildJoinMessage({
        potId: id,
        pick: hostPick,
        stake,
        address: wallet.address,
      })
      const signature = await signJoinMessage(wallet.seedPhrase, msg)

      const pot: Pot = {
        id,
        title: title.trim() || `${homeTeam} vs ${awayTeam}`,
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        kickoff: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        stake,
        currency: "USDt",
        hostAddress: wallet.address,
        status: "open",
        participants: [
          {
            address: wallet.address,
            name: hostName.trim() || "Host",
            pick: hostPick,
            stake,
            joinedAt: new Date().toISOString(),
            signature,
          },
        ],
        createdAt: new Date().toISOString(),
      }

      savePot(pot)
      router.push(`/pot/${pot.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onCreate} className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Create matchday pot</h2>
        <p className="text-sm text-gray-400">Equal stake. Winner-takes-split after full time. You hold your keys.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {samples.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => applySample(i)}
            className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300 hover:border-emerald-600 hover:text-white"
          >
            {s.homeTeam}–{s.awayTeam}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-gray-400">Home</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-400">Away</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-gray-400">Pot title</span>
        <input
          className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-gray-400">Stake (USDt each)</span>
          <input
            type="number"
            min={1}
            max={10000}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-400">Your name</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm text-gray-400 mb-2">Your pick</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["home", homeTeam || "Home"],
              ["draw", "Draw"],
              ["away", awayTeam || "Away"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setHostPick(value)}
              className={`rounded-lg border px-4 py-2 text-sm ${
                hostPick === value
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                  : "border-gray-700 text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? "Signing with WDK…" : "Create pot & sign join"}
      </Button>
    </form>
  )
}
