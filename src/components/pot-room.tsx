"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  canJoin,
  payoutPlan,
  shortAddr,
  sideLabel,
  totalPool,
  winners,
} from "@/lib/pot"
import { encodePotShare, getPot, loadWallet, savePot, saveWallet } from "@/lib/store"
import type { LocalWallet, MatchSide, Pot } from "@/lib/types"
import {
  buildJoinMessage,
  generateSeedPhrase,
  getAddressFromSeed,
  signJoinMessage,
} from "@/lib/wdk-client"

export function PotRoom({ potId }: { potId: string }) {
  const [pot, setPot] = useState<Pot | null>(null)
  const [wallet, setWallet] = useState<LocalWallet | null>(null)
  const [name, setName] = useState("Fan")
  const [pick, setPick] = useState<MatchSide>("home")
  const [result, setResult] = useState<MatchSide>("home")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [simBusy, setSimBusy] = useState(false)

  function refresh() {
    setPot(getPot(potId))
    setWallet(loadWallet())
  }

  useEffect(() => {
    refresh()
  }, [potId])

  const plan = useMemo(() => (pot ? payoutPlan(pot) : []), [pot])
  const isHost =
    pot && wallet && pot.hostAddress.toLowerCase() === wallet.address.toLowerCase()

  async function join() {
    if (!pot || !wallet) return
    setBusy(true)
    setError(null)
    try {
      const block = canJoin(pot, wallet.address)
      if (block) {
        setError(block)
        return
      }
      const msg = buildJoinMessage({
        potId: pot.id,
        pick,
        stake: pot.stake,
        address: wallet.address,
      })
      const signature = await signJoinMessage(wallet.seedPhrase, msg)
      const next: Pot = {
        ...pot,
        participants: [
          ...pot.participants,
          {
            address: wallet.address,
            name: name.trim() || "Fan",
            pick,
            stake: pot.stake,
            joinedAt: new Date().toISOString(),
            signature,
          },
        ],
      }
      savePot(next)
      setPot(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Join failed")
    } finally {
      setBusy(false)
    }
  }

  function lockPot() {
    if (!pot) return
    const next: Pot = { ...pot, status: "locked" }
    savePot(next)
    setPot(next)
  }

  function settle() {
    if (!pot) return
    const next: Pot = {
      ...pot,
      status: "settled",
      result,
      settledAt: new Date().toISOString(),
    }
    savePot(next)
    setPot(next)
  }

  function markPaid(address: string) {
    if (!pot) return
    const next: Pot = {
      ...pot,
      participants: pot.participants.map((p) =>
        p.address.toLowerCase() === address.toLowerCase()
          ? { ...p, paidOut: true }
          : p
      ),
    }
    savePot(next)
    setPot(next)
  }

  async function copyShare() {
    if (!pot) return
    const encoded = encodePotShare(pot)
    const url = `${window.location.origin}/import?d=${encodeURIComponent(encoded)}`
    await navigator.clipboard.writeText(url)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  /** Demo helper: create a second WDK wallet, join with opposite pick, switch back. */
  async function simulateFriend() {
    if (!pot || !wallet) return
    setSimBusy(true)
    setError(null)
    try {
      const hostSeed = wallet.seedPhrase
      const hostAddress = wallet.address
      const friendSeed = generateSeedPhrase()
      const friendAddress = await getAddressFromSeed(friendSeed)
      const friendPick: MatchSide =
        pot.participants[0]?.pick === "home" ? "away" : "home"
      const msg = buildJoinMessage({
        potId: pot.id,
        pick: friendPick,
        stake: pot.stake,
        address: friendAddress,
      })
      // Temporarily use friend seed to sign
      const signature = await signJoinMessage(friendSeed, msg)
      const next: Pot = {
        ...pot,
        participants: [
          ...pot.participants,
          {
            address: friendAddress,
            name: "Friend (demo)",
            pick: friendPick,
            stake: pot.stake,
            joinedAt: new Date().toISOString(),
            signature,
          },
        ],
      }
      savePot(next)
      setPot(next)
      // Keep host wallet as active session
      saveWallet({
        address: hostAddress,
        seedPhrase: hostSeed,
        createdAt: wallet.createdAt,
      })
      setWallet(loadWallet())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulate failed")
    } finally {
      setSimBusy(false)
    }
  }

  if (!pot) {
    return (
      <div className="rounded-xl border border-gray-800 p-6 text-center">
        <p className="text-gray-300">Pot not found in this browser.</p>
        <p className="mt-2 text-sm text-gray-500">
          Import a share link or create a new pot.
        </p>
        <Link href="/" className="mt-4 inline-block text-emerald-400 underline">
          Home
        </Link>
      </div>
    )
  }

  const alreadyIn =
    wallet &&
    pot.participants.some(
      (p) => p.address.toLowerCase() === wallet.address.toLowerCase()
    )

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500">{pot.status}</p>
            <h1 className="text-2xl font-bold text-white">{pot.title}</h1>
            <p className="mt-1 text-lg text-gray-200">
              {pot.homeTeam} <span className="text-gray-500">vs</span> {pot.awayTeam}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Stake {pot.stake} {pot.currency} each · Pool{" "}
              <span className="text-white font-medium">{totalPool(pot)} {pot.currency}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Host {shortAddr(pot.hostAddress)} · id {pot.id}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copyShare}>
            {shareCopied ? "Copied" : "Copy share link"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Pick</th>
              <th className="px-4 py-3 font-medium">Stake</th>
              <th className="px-4 py-3 font-medium">WDK sig</th>
            </tr>
          </thead>
          <tbody>
            {pot.participants.map((p) => (
              <tr key={p.address} className="border-t border-gray-800">
                <td className="px-4 py-3">
                  <div className="text-white">{p.name}</div>
                  <div className="font-mono text-xs text-gray-500">{shortAddr(p.address)}</div>
                </td>
                <td className="px-4 py-3 text-gray-200">{sideLabel(p.pick, pot)}</td>
                <td className="px-4 py-3">
                  {p.stake} {pot.currency}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-500/80">
                  {p.signature.slice(0, 12)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {wallet && pot.status === "open" && !alreadyIn && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-3">
          <h2 className="font-semibold text-white">Join this pot</h2>
          <label className="block text-sm">
            <span className="text-gray-400">Display name</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["home", pot.homeTeam],
                ["draw", "Draw"],
                ["away", pot.awayTeam],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPick(value)}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  pick === value
                    ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                    : "border-gray-700 text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button onClick={join} disabled={busy}>
            {busy ? "Signing…" : `Join · ${pot.stake} ${pot.currency} · WDK sign`}
          </Button>
        </div>
      )}

      {wallet && pot.status === "open" && alreadyIn && isHost && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={simulateFriend} disabled={simBusy}>
            {simBusy ? "Adding…" : "Add demo friend (new WDK wallet)"}
          </Button>
          <Button variant="outline" onClick={lockPot} disabled={pot.participants.length < 2}>
            Lock picks
          </Button>
        </div>
      )}

      {isHost && (pot.status === "locked" || pot.status === "open") && pot.participants.length >= 1 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-3">
          <h2 className="font-semibold text-white">Settle full time</h2>
          <p className="text-sm text-gray-400">
            Host marks the official result. Pool splits equally among correct picks.
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["home", pot.homeTeam],
                ["draw", "Draw"],
                ["away", pot.awayTeam],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setResult(value)}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  result === value
                    ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                    : "border-gray-700 text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button onClick={settle}>Settle pot</Button>
        </div>
      )}

      {pot.status === "settled" && pot.result && (
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-white">Result: {sideLabel(pot.result, pot)}</h2>
            <p className="text-sm text-gray-400">
              {winners(pot).length} winner(s) · pool {totalPool(pot)} {pot.currency}
            </p>
          </div>
          {plan.length === 0 ? (
            <p className="text-sm text-amber-300">No correct picks. Return stakes peer-to-peer.</p>
          ) : (
            <ul className="space-y-2">
              {plan.map((row) => {
                const p = pot.participants.find(
                  (x) => x.address.toLowerCase() === row.address.toLowerCase()
                )
                return (
                  <li
                    key={row.address}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2"
                  >
                    <div>
                      <div className="text-white">{row.name}</div>
                      <div className="font-mono text-xs text-gray-500">{shortAddr(row.address)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-emerald-300">
                        {row.amount} {pot.currency}
                      </span>
                      {isHost && (
                        <Button
                          size="sm"
                          variant={p?.paidOut ? "ghost" : "outline"}
                          onClick={() => markPaid(row.address)}
                          disabled={p?.paidOut}
                        >
                          {p?.paidOut ? "Paid" : "Mark paid"}
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="text-xs text-gray-500">
            Payouts are peer-to-peer USDt to winner addresses. WDK holds keys for each player.
            Live on-chain send is optional when funded (Sepolia RPC configured).
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!wallet && (
        <p className="text-sm text-amber-300">
          Create a WDK wallet on the home page to join or host.
        </p>
      )}
    </div>
  )
}
