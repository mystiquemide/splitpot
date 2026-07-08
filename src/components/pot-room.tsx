"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignRequest, type SignResult } from "@/components/sign-request"
import { TransferRequest, type TransferResult } from "@/components/transfer-request"
import {
  canJoin,
  payoutPlan,
  shortAddr,
  sideLabel,
  totalPool,
  winners,
} from "@/lib/pot"
import { encodePotShare, getPot, loadWallet, savePot } from "@/lib/store"
import type { MatchSide, Pot } from "@/lib/types"
import { buildJoinMessage, buildSettleMessage } from "@/lib/wdk-client"
import { getUsdtConfig, txUrl } from "@/lib/chain"

export function PotRoom({ potId }: { potId: string }) {
  const usdt = getUsdtConfig()
  const [pot, setPot] = useState<Pot | null>(null)
  const [wallet, setWallet] = useState<ReturnType<typeof loadWallet>>(null)
  const [name, setName] = useState("")
  const [pick, setPick] = useState<MatchSide>("home")
  const [result, setResult] = useState<MatchSide>("home")
  const [error, setError] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [joinSignOpen, setJoinSignOpen] = useState(false)
  const [joinMessage, setJoinMessage] = useState("")
  const [settleSignOpen, setSettleSignOpen] = useState(false)
  const [settleMessage, setSettleMessage] = useState("")
  const [depositOpen, setDepositOpen] = useState(false)
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [payoutTarget, setPayoutTarget] = useState<{
    address: string
    amount: number
    name: string
  } | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => {
      setPot(getPot(potId))
      setWallet(loadWallet())
      setLoaded(true)
    }, 0)
    return () => window.clearTimeout(t)
  }, [potId])

  // Keep wallet in sync if user unlocks on this page
  useEffect(() => {
    const id = window.setInterval(() => setWallet(loadWallet()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const plan = useMemo(() => (pot ? payoutPlan(pot) : []), [pot])
  const isHost =
    !!pot &&
    !!wallet &&
    pot.hostAddress.toLowerCase() === wallet.address.toLowerCase()

  function openJoinSign() {
    if (!pot || !wallet) return
    const block = canJoin(pot, wallet.address)
    if (block) {
      setError(block)
      return
    }
    if (!name.trim()) {
      setError("Enter a display name so others know who you are.")
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
      onChain: pot.onChain,
      tokenAddress: pot.tokenAddress || usdt?.address,
    })
    setJoinMessage(msg)
    setJoinSignOpen(true)
  }

  async function onJoinSigned(sig: SignResult) {
    if (!pot || !wallet) return
    const participant = {
      address: wallet.address,
      name: name.trim(),
      pick,
      stake: pot.stake,
      joinedAt: new Date().toISOString(),
      signature: sig.signature,
      verified: sig.verified,
      signedMessage: sig.message,
    }
    const next: Pot = {
      ...pot,
      participants: [...pot.participants, participant],
    }
    savePot(next)
    setPot(next)
    setJoinSignOpen(false)
    if (next.onChain) setDepositOpen(true)
  }

  async function onDepositTransferred(tx: TransferResult) {
    if (!pot || !wallet) return
    const next: Pot = {
      ...pot,
      participants: pot.participants.map((p) =>
        p.address.toLowerCase() === wallet.address.toLowerCase()
          ? { ...p, depositTxHash: tx.hash, depositConfirmed: true }
          : p
      ),
    }
    savePot(next)
    setPot(next)
    setDepositOpen(false)
  }

  function lockPot() {
    if (!pot) return
    if (pot.participants.length < 2) {
      setError("Need at least two players before locking picks.")
      return
    }
    if (pot.onChain) {
      const unpaid = pot.participants.filter(
        (p) =>
          p.address.toLowerCase() !== pot.hostAddress.toLowerCase() &&
          !p.depositConfirmed
      )
      if (unpaid.length > 0) {
        setError(
          `${unpaid.length} player${unpaid.length > 1 ? "s still need" : " still needs"} to send their USDt stake before you can lock.`
        )
        return
      }
    }
    const next: Pot = { ...pot, status: "locked" }
    savePot(next)
    setPot(next)
    setError(null)
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

  function openPayout(address: string, amount: number, playerName: string) {
    setPayoutTarget({ address, amount, name: playerName })
    setPayoutOpen(true)
  }

  async function onPayoutTransferred(tx: TransferResult) {
    if (!pot || !payoutTarget) return
    const next: Pot = {
      ...pot,
      participants: pot.participants.map((p) =>
        p.address.toLowerCase() === payoutTarget.address.toLowerCase()
          ? { ...p, paidOut: true, payoutTxHash: tx.hash }
          : p
      ),
    }
    savePot(next)
    setPot(next)
    setPayoutOpen(false)
    setPayoutTarget(null)
  }

  async function copyShare() {
    if (!pot) return
    const encoded = encodePotShare(pot)
    const url = `${window.location.origin}/import?d=${encodeURIComponent(encoded)}`
    await navigator.clipboard.writeText(url)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  if (!loaded) {
    return (
      <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
        Loading pot…
      </p>
    )
  }

  if (!pot) {
    return (
      <div className="proof-card-flat p-6 space-y-4">
        <h1 className="font-display text-2xl text-black">Pot not found</h1>
        <p className="text-sm text-neutral-600 leading-relaxed">
          This browser doesn’t have that pot saved. Open a share link from the host, or
          create a new pot.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/app">
            <Button>Go to app</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const alreadyIn =
    wallet &&
    pot.participants.some(
      (p) => p.address.toLowerCase() === wallet.address.toLowerCase()
    )

  const me = wallet
    ? pot.participants.find(
        (p) => p.address.toLowerCase() === wallet.address.toLowerCase()
      )
    : null

  const explorer = usdt?.explorerTx || "https://etherscan.io/tx/"
  const needsDeposit =
    pot.onChain &&
    me &&
    !me.depositConfirmed &&
    me.depositTxHash !== "host-escrow"

  return (
    <div className="space-y-6">
      <div className="proof-card-flat p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="stamp">{pot.status}</span>
              {pot.onChain && <span className="stamp">on-chain USDt</span>}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-black leading-tight">
              {pot.title}
            </h1>
            <p className="mt-2 font-display text-xl text-black">
              {pot.homeTeam}{" "}
              <span className="text-neutral-400 text-base font-sans">vs</span> {pot.awayTeam}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Stake {pot.stake} {pot.currency} each · Pool{" "}
              <span className="text-black font-medium">
                {totalPool(pot)} {pot.currency}
              </span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mt-2">
              Host {shortAddr(pot.hostAddress)}
              {pot.chainName ? ` · ${pot.chainName}` : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copyShare}>
            {shareCopied ? "Link copied" : "Copy invite link"}
          </Button>
        </div>
        {pot.status === "open" && (
          <p className="mt-4 text-sm text-neutral-600 border-t-2 border-black pt-4 leading-relaxed">
            Share the invite link so friends can join on their phones. When everyone has joined
            {pot.onChain ? " and sent their stake" : ""}, the host locks picks.
          </p>
        )}
      </div>

      <div className="proof-card-flat overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black text-white text-left font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Pick</th>
              <th className="px-4 py-3 font-medium">Stake</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pot.participants.map((p) => (
              <tr key={p.address} className="border-t-2 border-black">
                <td className="px-4 py-3">
                  <div className="text-black font-medium">{p.name}</div>
                  <div className="font-mono text-xs text-neutral-500">
                    {shortAddr(p.address)}
                  </div>
                </td>
                <td className="px-4 py-3 text-black">{sideLabel(p.pick, pot)}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {p.stake} {pot.currency}
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-wide text-black">
                    {p.verified ? "Pick signed" : "Signed"}
                  </div>
                  {pot.onChain && (
                    <div className="mt-0.5 text-[11px] text-neutral-600">
                      {p.depositTxHash === "host-escrow" ? (
                        "Host holds the pool"
                      ) : p.depositConfirmed && p.depositTxHash ? (
                        <a
                          href={txUrl(p.depositTxHash, explorer)}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 text-black"
                        >
                          Stake sent
                        </a>
                      ) : p.depositConfirmed ? (
                        "Stake received"
                      ) : (
                        "Stake pending"
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {needsDeposit && (
        <div className="proof-card-flat bg-neutral-100 p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-black leading-relaxed">
            Your pick is signed. Send {pot.stake} USDt to the host to finish joining.
          </p>
          <Button size="sm" onClick={() => setDepositOpen(true)}>
            Send stake
          </Button>
        </div>
      )}

      {!wallet && pot.status === "open" && (
        <div className="proof-card-flat p-5 space-y-3">
          <h2 className="font-display text-xl text-black">Join this pot</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Create or import a wallet on this page, then come back to sign your pick.
          </p>
          <Link href="/app">
            <Button>Create wallet in app</Button>
          </Link>
        </div>
      )}

      {wallet && pot.status === "open" && !alreadyIn && (
        <div className="proof-card-flat p-5 space-y-4">
          <div>
            <h2 className="font-display text-xl text-black">Join this pot</h2>
            <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
              Choose a pick and sign it with your wallet
              {pot.onChain ? ", then send your stake in USDt." : "."}
            </p>
          </div>
          <label className="block text-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Your name
            </span>
            <input
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              required
            />
          </label>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
              Your pick
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
                  onClick={() => setPick(value)}
                  className={`border-2 border-black px-4 py-2 text-sm font-mono uppercase tracking-wide ${
                    pick === value
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-neutral-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={openJoinSign}>
            Sign pick · {pot.stake} {pot.currency}
          </Button>
        </div>
      )}

      {wallet && pot.status === "open" && alreadyIn && isHost && (
        <div className="proof-card-flat p-5 space-y-3">
          <h2 className="font-display text-xl text-black">Host controls</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {pot.participants.length < 2
              ? "Copy the invite link and wait for at least one more player."
              : "When everyone has joined, lock picks so no one can change theirs."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyShare}>
              {shareCopied ? "Link copied" : "Copy invite link"}
            </Button>
            <Button
              onClick={lockPot}
              disabled={pot.participants.length < 2}
            >
              Lock picks
            </Button>
          </div>
        </div>
      )}

      {wallet && pot.status === "open" && alreadyIn && !isHost && !needsDeposit && (
        <div className="proof-card-flat p-5">
          <p className="text-sm text-black leading-relaxed">
            You’re in. Wait for the host to lock picks after everyone has joined
            {pot.onChain ? " and sent their stake" : ""}.
          </p>
        </div>
      )}

      {isHost && pot.status === "locked" && (
        <div className="proof-card-flat p-5 space-y-4">
          <div>
            <h2 className="font-display text-xl text-black">Settle full time</h2>
            <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
              Record the official result. Correct picks split the pool evenly.
            </p>
          </div>
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
                className={`border-2 border-black px-4 py-2 text-sm font-mono uppercase tracking-wide ${
                  result === value
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-neutral-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button onClick={openSettleSign}>Sign and settle</Button>
        </div>
      )}

      {pot.status === "settled" && pot.result && (
        <div className="proof-card p-5 space-y-4">
          <div>
            <h2 className="font-display text-2xl text-black">
              Result: {sideLabel(pot.result, pot)}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {winners(pot).length === 0
                ? "No correct picks."
                : `${winners(pot).length} winner${winners(pot).length > 1 ? "s" : ""} · pool ${totalPool(pot)} ${pot.currency}`}
            </p>
          </div>
          {plan.length === 0 ? (
            <p className="text-sm text-neutral-600 leading-relaxed">
              {pot.onChain
                ? "Return each player’s stake from the host wallet."
                : "Return each player’s stake peer-to-peer."}
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
                    className="flex flex-wrap items-center justify-between gap-2 border-2 border-black bg-white px-3 py-3"
                  >
                    <div>
                      <div className="text-black font-medium">{row.name}</div>
                      <div className="font-mono text-xs text-neutral-500">
                        {shortAddr(row.address)}
                      </div>
                      {p?.payoutTxHash && (
                        <a
                          href={txUrl(p.payoutTxHash, explorer)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-black underline underline-offset-2"
                        >
                          View payment
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-black">
                        {row.amount} {pot.currency}
                      </span>
                      {isHost && pot.onChain && !p?.paidOut && (
                        <Button
                          size="sm"
                          onClick={() => openPayout(row.address, row.amount, row.name)}
                        >
                          Pay USDt
                        </Button>
                      )}
                      {isHost && !pot.onChain && !p?.paidOut && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markPaid(row.address)}
                        >
                          Mark paid
                        </Button>
                      )}
                      {p?.paidOut && (
                        <span className="stamp">Paid</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {pot.onChain && isHost && (
            <p className="text-xs text-neutral-500 leading-relaxed">
              Payments send USDt from your host wallet with WDK. You need enough balance and gas.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="font-mono text-xs uppercase tracking-wide border-l-2 border-black pl-3 text-black">
          {error}
        </p>
      )}

      {wallet && joinMessage && (
        <SignRequest
          open={joinSignOpen}
          onClose={() => setJoinSignOpen(false)}
          wallet={wallet}
          title="Sign your pick"
          subtitle="Read the message, then sign with your wallet. This locks your pick to your address."
          message={joinMessage}
          confirmLabel="Sign pick"
          onSigned={onJoinSigned}
        />
      )}

      {wallet && settleMessage && (
        <SignRequest
          open={settleSignOpen}
          onClose={() => setSettleSignOpen(false)}
          wallet={wallet}
          title="Sign the result"
          subtitle="As host, you confirm the final match result for this pot."
          message={settleMessage}
          confirmLabel="Sign and settle"
          onSigned={onSettleSigned}
        />
      )}

      {wallet && pot.onChain && (
        <TransferRequest
          open={depositOpen}
          onClose={() => setDepositOpen(false)}
          wallet={wallet}
          kind="deposit"
          amountHuman={pot.stake}
          to={pot.hostAddress}
          potId={pot.id}
          onTransferred={onDepositTransferred}
        />
      )}

      {wallet && pot.onChain && payoutTarget && (
        <TransferRequest
          open={payoutOpen}
          onClose={() => {
            setPayoutOpen(false)
            setPayoutTarget(null)
          }}
          wallet={wallet}
          kind="payout"
          amountHuman={payoutTarget.amount}
          to={payoutTarget.address}
          potId={pot.id}
          onTransferred={onPayoutTransferred}
        />
      )}
    </div>
  )
}
