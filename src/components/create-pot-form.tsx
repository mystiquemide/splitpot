"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SignRequest, type SignResult } from "@/components/sign-request"
import { createPotId, sampleMatches, shortAddr } from "@/lib/pot"
import { savePot } from "@/lib/store"
import type { LocalWallet, Pot } from "@/lib/types"
import { buildJoinMessage } from "@/lib/wdk-client"
import { getUsdtConfig, isOnChainConfigured } from "@/lib/chain"

export function CreatePotForm({ wallet }: { wallet: LocalWallet }) {
  const router = useRouter()
  const samples = sampleMatches()
  const usdt = getUsdtConfig()
  const chainReady = isOnChainConfigured()

  const [homeTeam, setHomeTeam] = useState<string>(samples[0].homeTeam)
  const [awayTeam, setAwayTeam] = useState<string>(samples[0].awayTeam)
  const [title, setTitle] = useState<string>(samples[0].title)
  const [stake, setStake] = useState(10)
  const [hostPick, setHostPick] = useState<"home" | "away" | "draw">("home")
  const [hostName, setHostName] = useState("Host")
  const [onChain, setOnChain] = useState(chainReady)
  const [error, setError] = useState<string | null>(null)
  const [signOpen, setSignOpen] = useState(false)
  const [pendingMessage, setPendingMessage] = useState("")
  const [pendingPot, setPendingPot] = useState<Omit<Pot, "participants"> | null>(null)

  function applySample(i: number) {
    const s = samples[i]
    setHomeTeam(s.homeTeam)
    setAwayTeam(s.awayTeam)
    setTitle(s.title)
  }

  function pickLabel(pick: "home" | "away" | "draw") {
    if (pick === "home") return homeTeam || "Home"
    if (pick === "away") return awayTeam || "Away"
    return "Draw"
  }

  function onPrepare(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (onChain && !chainReady) {
      setError("On-chain mode needs NEXT_PUBLIC_USDT_ADDRESS in env")
      return
    }
    const id = createPotId()
    const potTitle = title.trim() || `${homeTeam} vs ${awayTeam}`
    const useOnChain = onChain && chainReady
    const message = buildJoinMessage({
      potId: id,
      potTitle,
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      pick: hostPick,
      pickLabel: pickLabel(hostPick),
      stake,
      address: wallet.address,
      onChain: useOnChain,
      tokenAddress: usdt?.address,
    })

    setPendingPot({
      id,
      title: potTitle,
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      kickoff: (() => {
        const d = new Date()
        d.setHours(d.getHours() + 2)
        return d.toISOString()
      })(),
      stake,
      currency: "USDt",
      hostAddress: wallet.address,
      status: "open",
      createdAt: new Date().toISOString(),
      onChain: useOnChain,
      tokenAddress: useOnChain ? usdt?.address : undefined,
      chainName: useOnChain ? usdt?.chainName : undefined,
    })
    setPendingMessage(message)
    setSignOpen(true)
  }

  async function onSigned(result: SignResult) {
    if (!pendingPot) return
    const pot: Pot = {
      ...pendingPot,
      participants: [
        {
          address: wallet.address,
          name: hostName.trim() || "Host",
          pick: hostPick,
          stake,
          joinedAt: new Date().toISOString(),
          signature: result.signature,
          verified: result.verified,
          signedMessage: result.message,
          // Host holds escrow; no self-transfer required
          depositConfirmed: pendingPot.onChain ? true : undefined,
          depositTxHash: pendingPot.onChain ? "host-escrow" : undefined,
        },
      ],
    }
    savePot(pot)
    setSignOpen(false)
    setPendingPot(null)
    setPendingMessage("")
    router.push(`/pot/${pot.id}`)
  }

  return (
    <>
      <form
        onSubmit={onPrepare}
        className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/40 p-5"
      >
        <div>
          <h2 className="text-lg font-semibold text-white">Create matchday pot</h2>
          <p className="text-sm text-gray-400">
            Equal stake. Sign your pick with WDK. Optional on-chain USDt stakes.
          </p>
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
              min={0.01}
              step="any"
              max={100000}
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

        <label
          className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer ${
            onChain && chainReady
              ? "border-emerald-800/60 bg-emerald-950/20"
              : "border-gray-800 bg-gray-950/40"
          }`}
        >
          <input
            type="checkbox"
            className="mt-1"
            checked={Boolean(onChain && chainReady)}
            disabled={!chainReady}
            onChange={(e) => setOnChain(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-white">
              On-chain USDt stakes
            </span>
            <span className="block text-xs text-gray-400 mt-1 leading-relaxed">
              {chainReady && usdt ? (
                <>
                  Joiners send stake via WDK to host {shortAddr(wallet.address)}. After settle,
                  host pays winners on-chain. Token {shortAddr(usdt.address)} on {usdt.chainName}.
                </>
              ) : (
                <>
                  Configure <code className="text-gray-300">NEXT_PUBLIC_USDT_ADDRESS</code> and a
                  matching RPC to enable.
                </>
              )}
            </span>
          </span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full sm:w-auto rounded-full">
          Review & sign to create
        </Button>
      </form>

      {pendingMessage && (
        <SignRequest
          open={signOpen}
          onClose={() => {
            setSignOpen(false)
            setPendingPot(null)
            setPendingMessage("")
          }}
          wallet={wallet}
          title="Sign to create pot"
          subtitle="WDK personal_sign. Verified before the pot is saved."
          message={pendingMessage}
          confirmLabel="Sign & create pot"
          onSigned={onSigned}
        />
      )}
    </>
  )
}
