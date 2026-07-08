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
        <p className="text-sm text-neutral-600 leading-relaxed">
          Set <code className="font-mono text-black">NEXT_PUBLIC_USDT_ADDRESS</code> (and matching
          RPC) in <code className="font-mono text-black">.env.local</code> to enable on-chain
          transfers.
        </p>
        <div className="mt-4 flex justify-end border-t-2 border-black pt-4">
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
        <p className="text-sm text-neutral-600">
          WDK will call ERC-20 <code className="font-mono text-black">transfer</code>. Keys stay on
          this device.
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="border-2 border-black px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">From</p>
            <p className="font-mono text-sm text-black">{shortAddr(wallet.address)}</p>
          </div>
          <div className="border-2 border-black px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">To</p>
            <p className="font-mono text-sm text-black">{shortAddr(to)}</p>
          </div>
        </div>

        <div className="border-2 border-black bg-neutral-50 px-4 py-4">
          <p className="font-display text-3xl text-black leading-none">
            {amountHuman}{" "}
            <span className="font-mono text-sm tracking-wider">{cfg.symbol}</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mt-2">
            {cfg.chainName} · {shortAddr(cfg.address)}
          </p>
          {balance != null && (
            <p className="font-mono text-xs text-neutral-600 mt-2">
              Balance: {balance} {cfg.symbol}
            </p>
          )}
          {feeHint && (
            <p className="font-mono text-[10px] text-neutral-500 mt-1">{feeHint}</p>
          )}
        </div>

        <pre className="max-h-36 overflow-auto border-2 border-black bg-white p-3 text-xs text-neutral-700 whitespace-pre-wrap font-mono">
          {summary}
        </pre>

        {done && (
          <div className="border-2 border-black bg-neutral-100 p-3 text-sm space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-black">
              Transaction sent
            </p>
            <p className="font-mono text-xs text-neutral-600 break-all">
              {shortenSig(done.hash, 12)}
            </p>
            <a
              href={txUrl(done.hash, cfg.explorerTx)}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs underline underline-offset-2"
            >
              View on explorer
            </a>
          </div>
        )}

        {error && (
          <p className="font-mono text-xs uppercase tracking-wide border-l-2 border-black pl-3 break-words">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 justify-end border-t-2 border-black pt-4">
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
