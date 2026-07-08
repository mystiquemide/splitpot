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
  const [hostName, setHostName] = useState("You")
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
      setError(
        "On-chain mode isn’t set up. Add NEXT_PUBLIC_USDT_ADDRESS and a matching RPC, or turn off on-chain stakes."
      )
      return
    }
    if (!hostName.trim()) {
      setError("Enter your display name.")
      return
    }
    if (!homeTeam.trim() || !awayTeam.trim()) {
      setError("Enter both team names.")
      return
    }
    if (!(stake > 0)) {
      setError("Stake must be greater than zero.")
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
          name: hostName.trim() || "You",
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
      <form onSubmit={onPrepare} className="space-y-5 proof-card p-6 bg-white text-black">
        <div className="border-b-2 border-[#0a0a0a] pb-4">
          <p className="stamp mb-3">New pot</p>
          <h2 className="font-display text-3xl sm:text-4xl text-[#0a0a0a] leading-tight">
            Create matchday pot
          </h2>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
            Equal stake. Sign your pick with WDK. Optional on-chain USDt stakes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {samples.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => applySample(i)}
              className="font-mono text-[10px] uppercase tracking-wider border-2 border-[#0a0a0a] px-3 py-1.5 text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fafafa]"
            >
              {s.homeTeam}–{s.awayTeam}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Home
            </span>
            <input
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Away
            </span>
            <input
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              required
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Pot title
          </span>
          <input
            className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Stake (USDt each)
            </span>
            <input
              type="number"
              min={0.01}
              step="any"
              max={100000}
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black font-mono"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Your name
            </span>
            <input
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
            />
          </label>
        </div>

        <fieldset>
          <legend className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
            Your pick
          </legend>
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
                className={`border-2 border-[#0a0a0a] px-4 py-2 text-sm font-mono uppercase tracking-wide ${
                  hostPick === value
                    ? "bg-[#0a0a0a] text-[#fafafa]"
                    : "bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <label
          className={`flex items-start gap-3 border-2 border-black p-4 cursor-pointer ${
            onChain && chainReady ? "bg-neutral-100" : "bg-white"
          }`}
        >
          <input
            type="checkbox"
            className="mt-1 accent-black"
            checked={Boolean(onChain && chainReady)}
            disabled={!chainReady}
            onChange={(e) => setOnChain(e.target.checked)}
          />
          <span>
            <span className="block font-mono text-xs uppercase tracking-wider text-black">
              On-chain USDt stakes
            </span>
            <span className="block text-xs text-neutral-600 mt-1 leading-relaxed">
              {chainReady && usdt ? (
                <>
                  Joiners send USDt to host {shortAddr(wallet.address)} via WDK. You temporarily
                  hold stakes (host escrow, not a smart contract). After settle you pay winners
                  on-chain. Token {shortAddr(usdt.address)} on {usdt.chainName}. RPC:{" "}
                  {usdt.chainName} (sees addresses).
                </>
              ) : (
                <>
                  Configure <code className="font-mono text-black">NEXT_PUBLIC_USDT_ADDRESS</code>{" "}
                  and a matching <code className="font-mono text-black">NEXT_PUBLIC_EVM_RPC_URL</code>{" "}
                  to enable. Both must be the same network.
                </>
              )}
            </span>
          </span>
        </label>
        {onChain && chainReady && (
          <p className="text-xs border-2 border-black bg-black text-white p-3 leading-relaxed">
            Warning: if you are host, players send you real USDt. Only use this with people who
            trust you not to withhold funds.
          </p>
        )}

        {error && (
          <p className="font-mono text-xs uppercase tracking-wide border-l-2 border-black pl-3">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Review and sign pot
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
          title="Sign pot"
          subtitle="Same ink-and-paper flow as the rest of Splitpot. You sign with WDK; we verify on this device before the pot is saved."
          message={pendingMessage}
          confirmLabel="Sign pot"
          onSigned={onSigned}
        />
      )}
    </>
  )
}
