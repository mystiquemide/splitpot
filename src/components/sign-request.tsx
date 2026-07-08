"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { shortAddr } from "@/lib/pot"
import {
  signMessageWithWdk,
  verifySignature,
  shortenSig,
} from "@/lib/wdk-client"
import type { LocalWallet } from "@/lib/types"

export type SignResult = {
  message: string
  signature: string
  verified: boolean
  address: string
}

type Props = {
  open: boolean
  onClose: () => void
  wallet: LocalWallet
  title?: string
  subtitle?: string
  message: string
  confirmLabel?: string
  onSigned: (result: SignResult) => void | Promise<void>
}

/**
 * Real wallet signing gate: user must read the message and click Sign.
 * WDK personal_sign runs only after confirm. Signature is verified on-device.
 */
export function SignRequest({
  open,
  onClose,
  wallet,
  title = "Sign with your wallet",
  subtitle = "WDK self-custodial signature. Keys never leave this device.",
  message,
  confirmLabel = "Sign with WDK",
  onSigned,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<SignResult | null>(null)

  async function handleSign() {
    setBusy(true)
    setError(null)
    try {
      const signature = await signMessageWithWdk(wallet.seedPhrase, message)
      const verified = await verifySignature(wallet.address, message, signature)
      if (!verified) {
        throw new Error("Signature failed verification. Try again.")
      }
      const result: SignResult = {
        message,
        signature,
        verified,
        address: wallet.address,
      }
      setDone(result)
      await onSigned(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signing failed")
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

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-gray-400">{subtitle}</p>

        <div className="rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2">
          <p className="text-xs text-gray-500">Signing as</p>
          <p className="font-mono text-sm text-white">{shortAddr(wallet.address)}</p>
          <p className="font-mono text-[11px] text-gray-500 break-all">{wallet.address}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Message to sign
          </p>
          <pre className="max-h-48 overflow-auto rounded-lg border border-gray-800 bg-black/50 p-3 text-xs text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
            {message}
          </pre>
        </div>

        {done && (
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 p-3 text-sm">
            <p className="text-emerald-400 font-medium">
              {done.verified ? "Signed and verified" : "Signed"}
            </p>
            <p className="font-mono text-xs text-gray-400 mt-1 break-all">
              {shortenSig(done.signature, 14)}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={handleClose} disabled={busy}>
            {done ? "Done" : "Reject"}
          </Button>
          {!done && (
            <Button onClick={handleSign} disabled={busy}>
              {busy ? "Signing…" : confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
