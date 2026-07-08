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
 * Sign confirm modal — same ink/paper system as the landing page.
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
      <div className="space-y-4 bg-white text-black">
        <p className="text-sm text-neutral-600 leading-relaxed">{subtitle}</p>

        <div className="border-2 border-black bg-[#fafafa] px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Signing as
          </p>
          <p className="font-mono text-sm text-black mt-0.5">{shortAddr(wallet.address)}</p>
          <p className="font-mono text-[10px] text-neutral-500 break-all">
            {wallet.address}
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1">
            Message to sign
          </p>
          <pre className="max-h-48 overflow-auto border-2 border-black bg-[#fafafa] p-3 text-xs text-black whitespace-pre-wrap font-mono leading-relaxed">
            {message}
          </pre>
        </div>

        {done && (
          <div className="border-2 border-black bg-black text-white p-3 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
              {done.verified ? "Signed and verified" : "Signed"}
            </p>
            <p className="font-mono text-xs text-neutral-300 mt-1 break-all">
              {shortenSig(done.signature, 14)}
            </p>
          </div>
        )}

        {error && (
          <p className="font-mono text-xs uppercase tracking-wide border-l-2 border-black pl-3 text-black">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 justify-end border-t-2 border-black pt-4">
          <Button variant="outline" onClick={handleClose} disabled={busy}>
            {done ? "Close" : "Cancel"}
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
