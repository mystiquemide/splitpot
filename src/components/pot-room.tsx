"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignRequest, type SignResult } from "@/components/sign-request"
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
  buildSettleMessage,
  generateSeedPhrase,
  getAddressFromSeed,
  signMessageWithWdk,
  verifySignature,
  shortenSig,
} from "@/lib/wdk-client"

export function PotRoom({ potId }: { potId: string }) {
  const [pot, setPot] = useState<Pot | null>(null)
  const [wallet, setWallet] = useState<LocalWallet | null>(null)
  const [name, setName] = useState("Fan")
  const [pick, setPick] = useState<MatchSide>("home")
  const [result, setResult] = useState<MatchSide>("home")
  const [error, setError] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [simBusy, setSimBusy] = useState(false)
  const [joinSignOpen, setJoinSignOpen] = useState(false)
  const [joinMessage, setJoinMessage] = useState("")
  const [settleSignOpen, setSettleSignOpen] = useState(false)
  const [settleMessage, setSettleMessage] = useState("")

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

  function openJoinSign() {
    if (!pot || !wallet) return
    const block = canJoin(pot, wallet.address)
    if (block) {
      setError(block)
      return
    }
    setError(null)
    const msg = buildJoinMessage({
      potId: pot.id,
      potTitle: pot.title,
      homeTeam: pot.homeTeam,
      awayTeam: pot.awayTeam,
      pick,
      pickLabel: sideLabel(pick, pot),
      stake: pot.stake,
      address: wallet.address,
    })
    setJoinMessage(msg)
    setJoinSignOpen(true)
  }

  async function onJoinSigned(result: SignResult) {
    if (!pot || !wallet) return
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
          signature: result.signature,
          verified: result.verified,
          signedMessage: result.message,
        },
      ],
    }
    savePot(next)
    setPot(next)
    setJoinSignOpen(false)
  }

  function lockPot() {
    if (!pot) return
    const next: Pot = { ...pot, status: "locked" }
    savePot(next)
    setPot(next)
  }

  function openSettleSign() {
    if (!pot || !wallet) return
    const msg = buildSettleMessage({
      potId: pot.id,
      result,
      resultLabel: sideLabel(result, pot),
      address: wallet.address,
    })
    setSettleMessage(msg)
    setSettleSignOpen(true)
  }

  async function onSettleSigned(sig: SignResult) {
    if (!pot) return
    const next: Pot = {
      ...pot,
      status: "settled",
      result,
      settledAt: new Date().toISOString(),
      settleSignature: sig.signature,
      settleMessage: sig.message,
    }
    savePot(next)
    setPot(next)
    setSettleSignOpen(false)
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

  /** Demo: second WDK wallet, real sign + verify, restore host session. */
  async function simulateFriend() {
    if (!pot || !wallet) return
    setSimBusy(true)
    setError(null)
    try {
      const hostSeed = wallet.seedPhrase
      const hostAddress = wallet.address
      const hostCreated = wallet.createdAt
      const friendSeed = generateSeedPhrase()
      const friendAddress = await getAddressFromSeed(friendSeed)
      const friendPick: MatchSide =
        pot.participants[0]?.pick === "home" ? "away" : "home"
      const msg = buildJoinMessage({
        potId: pot.id,
        potTitle: pot.title,
        homeTeam: pot.homeTeam,
        awayTeam: pot.awayTeam,
        pick: friendPick,
        pickLabel: sideLabel(friendPick, pot),
        stake: pot.stake,
        address: friendAddress,
      })
      const signature = await signMessageWithWdk(friendSeed, msg)
      const verified = await verifySignature(friendAddress, msg, signature)
      if (!verified) throw new Error("Friend signature failed verification")
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
            verified,
            signedMessage: msg,
          },
        ],
      }
      savePot(next)
      setPot(next)
      saveWallet({
        address: hostAddress,
        seedPhrase: hostSeed,
        createdAt: hostCreated,
        unlockSignature: wallet.unlockSignature,
        unlockedAt: wallet.unlockedAt,
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
        <Link href="/app" className="mt-4 inline-block text-emerald-400 underline">
          Open app
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
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-500">{pot.status}</p>
            <h1 className="text-2xl font-bold text-white">{pot.title}</h1>
            <p className="mt-1 text-lg text-gray-200">
              {pot.homeTeam} <span className="text-gray-500">vs</span> {pot.awayTeam}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Stake {pot.stake} {pot.currency} each · Pool{" "}
              <span className="text-white font-medium">
                {totalPool(pot)} {pot.currency}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Host {shortAddr(pot.hostAddress)} · id {pot.id}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copyShare} className="rounded-full">
            {shareCopied ? "Copied" : "Copy share link"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Pick</th>
              <th className="px-4 py-3 font-medium">Stake</th>
              <th className="px-4 py-3 font-medium">Signature</th>
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
                <td className="px-4 py-3">
                  <div className="font-mono text-xs text-gray-400">{shortenSig(p.signature, 6)}</div>
                  {p.verified ? (
                    <span className="text-[11px] text-emerald-400">verified</span>
                  ) : (
                    <span className="text-[11px] text-gray-500">signed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {wallet && pot.status === "open" && !alreadyIn && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5 space-y-3">
          <h2 className="font-semibold text-white">Join this pot</h2>
          <p className="text-sm text-gray-400">
            You will review a message and sign with your WDK wallet. No silent signing.
          </p>
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
          <Button onClick={openJoinSign} className="rounded-full">
            Review & sign to join · {pot.stake} {pot.currency}
          </Button>
        </div>
      )}

      {wallet && pot.status === "open" && alreadyIn && isHost && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={simulateFriend}
            disabled={simBusy}
            className="rounded-full"
          >
            {simBusy ? "Signing friend…" : "Add demo friend (WDK sign + verify)"}
          </Button>
          <Button
            variant="outline"
            onClick={lockPot}
            disabled={pot.participants.length < 2}
            className="rounded-full"
          >
            Lock picks
          </Button>
        </div>
      )}

      {isHost &&
        (pot.status === "locked" || pot.status === "open") &&
        pot.participants.length >= 1 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5 space-y-3">
            <h2 className="font-semibold text-white">Settle full time</h2>
            <p className="text-sm text-gray-400">
              Host signs the official result. Pool splits equally among correct picks.
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
            <Button onClick={openSettleSign} className="rounded-full">
              Review & sign to settle
            </Button>
          </div>
        )}

      {pot.status === "settled" && pot.result && (
        <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-white">
              Result: {sideLabel(pot.result, pot)}
            </h2>
            <p className="text-sm text-gray-400">
              {winners(pot).length} winner(s) · pool {totalPool(pot)} {pot.currency}
            </p>
            {pot.settleSignature && (
              <p className="text-xs font-mono text-emerald-500/80 mt-1">
                host settle {shortenSig(pot.settleSignature, 8)}
              </p>
            )}
          </div>
          {plan.length === 0 ? (
            <p className="text-sm text-amber-300">
              No correct picks. Return stakes peer-to-peer.
            </p>
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
                      <div className="font-mono text-xs text-gray-500">
                        {shortAddr(row.address)}
                      </div>
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
                          className="rounded-full"
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
            Payouts are peer-to-peer USDt to winner addresses. Each player keeps their own WDK
            keys.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!wallet && (
        <p className="text-sm text-amber-300">
          <Link href="/app" className="underline">
            Open the app
          </Link>{" "}
          and unlock a WDK wallet to join or host.
        </p>
      )}

      {wallet && joinMessage && (
        <SignRequest
          open={joinSignOpen}
          onClose={() => setJoinSignOpen(false)}
          wallet={wallet}
          title="Sign to join pot"
          subtitle="Review the pick and stake, then sign with WDK. Signature is verified before you are added."
          message={joinMessage}
          confirmLabel="Sign & join"
          onSigned={onJoinSigned}
        />
      )}

      {wallet && settleMessage && (
        <SignRequest
          open={settleSignOpen}
          onClose={() => setSettleSignOpen(false)}
          wallet={wallet}
          title="Sign to settle pot"
          subtitle="Host-only. Signing locks the full-time result for the payout plan."
          message={settleMessage}
          confirmLabel="Sign & settle"
          onSigned={onSettleSigned}
        />
      )}
    </div>
  )
}
