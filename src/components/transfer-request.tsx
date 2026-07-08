"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { shortAddr } from "@/lib/pot"
import {
  buildTransferSummary,
  getUsdtBalance,
  quoteUsdtTransfer,
  transferUsdt,
  shortenSig,
} from "@/lib/wdk-client"
import {
  formatTokenUnits,
  getUsdtConfig,
  txUrl,
  type UsdtConfig,
} from "@/lib/chain"
import type { LocalWallet } from "@/lib/types"

export type TransferResult = {
  hash: string
  amountHuman: number
  to: string
  amountUnits: bigint
}

type Props = {
  open: boolean
  onClose: () => void
  wallet: LocalWallet
  kind: "deposit" | "payout"
  amountHuman: number
  to: string
  potId: string
  onTransferred: (result: TransferResult) => void | Promise<void>
}

/**
 * Explicit on-chain USDt transfer gate. User must confirm before WDK transfer().
 */
export function TransferRequest({
  open,
  onClose,
  wallet,
  kind,
  amountHuman,
  to,
  potId,
  onTransferred,
}: Props) {
  const cfg = getUsdtConfig()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<TransferResult | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [feeHint, setFeeHint] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !cfg) return
    let cancelled = false
    const t = window.setTimeout(async () => {
      try {
        const bal = await getUsdtBalance(wallet.seedPhrase, cfg)
        if (!cancelled) setBalance(formatTokenUnits(bal, cfg.decimals))
        const q = await quoteUsdtTransfer({
          seedPhrase: wallet.seedPhrase,
          to,
          amountHuman,
          config: cfg,
        })
        if (!cancelled && q?.fee != null) {
          setFeeHint(`Est. gas fee: ${q.fee.toString()} wei`)
        }
      } catch {
        if (!cancelled) setBalance(null)
      }
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [open, wallet.seedPhrase, to, amountHuman, cfg])

  if (!cfg) {
    return (
      <Modal open={open} onClose={onClose} title="USDt not configured">
        <p className="text-sm text-gray-300">
          Set <code className="text-emerald-400">NEXT_PUBLIC_USDT_ADDRESS</code> (and
          matching RPC) in <code className="text-gray-400">.env.local</code> to enable
          on-chain transfers.
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    )
  }

  const summary = buildTransferSummary({
    kind,
    amount: amountHuman,
    symbol: cfg.symbol,
    to,
    potId,
    token: cfg.address,
    chainName: cfg.chainName,
  })

  async function handleSend(config: UsdtConfig) {
    setBusy(true)
    setError(null)
    try {
      const { hash, amountUnits } = await transferUsdt({
        seedPhrase: wallet.seedPhrase,
        to,
        amountHuman,
        config,
      })
      const result: TransferResult = {
        hash,
        amountHuman,
        to,
        amountUnits,
      }
      setDone(result)
      await onTransferred(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transfer failed")
    } finally {
      setBusy(false)
    }
  }

  function handleClose() {
    if (busy) return
    setDone(null)
    setError(null)
    onClose()
  }

  const title =
    kind === "deposit" ? "Send stake on-chain" : "Pay winner on-chain"

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          WDK will call ERC-20 <code className="text-gray-300">transfer</code>. Keys stay
          on this device.
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2">
            <p className="text-xs text-gray-500">From</p>
            <p className="font-mono text-sm text-white">{shortAddr(wallet.address)}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2">
            <p className="text-xs text-gray-500">To</p>
            <p className="font-mono text-sm text-white">{shortAddr(to)}</p>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-3">
          <p className="text-2xl font-bold text-white">
            {amountHuman}{" "}
            <span className="text-base font-medium text-emerald-400">{cfg.symbol}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {cfg.chainName} · {shortAddr(cfg.address)}
          </p>
          {balance != null && (
            <p className="text-xs text-gray-400 mt-1">
              Your balance: {balance} {cfg.symbol}
            </p>
          )}
          {feeHint && <p className="text-xs text-gray-500 mt-1">{feeHint}</p>}
        </div>

        <pre className="max-h-36 overflow-auto rounded-lg border border-gray-800 bg-black/50 p-3 text-xs text-gray-300 whitespace-pre-wrap font-mono">
          {summary}
        </pre>

        {done && (
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 p-3 text-sm space-y-1">
            <p className="text-emerald-400 font-medium">Transaction sent</p>
            <p className="font-mono text-xs text-gray-400 break-all">
              {shortenSig(done.hash, 12)}
            </p>
            <a
              href={txUrl(done.hash, cfg.explorerTx)}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 underline"
            >
              View on explorer
            </a>
          </div>
        )}

        {error && <p className="text-sm text-red-400 break-words">{error}</p>}

        <div className="flex flex-wrap gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={handleClose} disabled={busy}>
            {done ? "Done" : "Cancel"}
          </Button>
          {!done && (
            <Button onClick={() => handleSend(cfg)} disabled={busy}>
              {busy ? "Sending…" : `Send ${amountHuman} ${cfg.symbol}`}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
