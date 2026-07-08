"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
  decodePotShare,
  potExists,
  readInvitePayloadFromLocation,
  savePot,
  verifyPotSignatures,
} from "@/lib/store"
import type { Pot } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { shortAddr } from "@/lib/pot"

function ImportInner() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "confirm" | "ok" | "err">("loading")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState<Pot | null>(null)
  const [overwrite, setOverwrite] = useState(false)
  const [sigWarning, setSigWarning] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(async () => {
      const d = readInvitePayloadFromLocation()
      if (!d) {
        setStatus("err")
        setMessage(
          "This link has no pot data. Ask the host for a new invite link (links use the #d= hash)."
        )
        return
      }
      const pot = decodePotShare(d)
      if (!pot) {
        setStatus("err")
        setMessage("This invite link is invalid or corrupted.")
        return
      }

      const check = await verifyPotSignatures(pot)
      if (!check.ok) {
        setSigWarning(
          `${check.failed.length} signature(s) failed verification. You can still import, but treat this pot carefully.`
        )
      }

      if (potExists(pot.id)) {
        setPending(pot)
        setOverwrite(true)
        setStatus("confirm")
        setMessage(
          `A pot with id ${pot.id} already exists on this device. Importing will replace it.`
        )
        return
      }

      setPending(pot)
      setStatus("confirm")
      setMessage(`Import “${pot.title}” (${pot.homeTeam} vs ${pot.awayTeam})?`)
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  async function confirmImport() {
    if (!pending) return
    setBusy(true)
    try {
      savePot(pending)
      setStatus("ok")
      setMessage(`Loaded “${pending.title}”. Opening pot…`)
      // Clear sensitive hash from history after import
      if (typeof window !== "undefined" && window.location.hash) {
        history.replaceState(null, "", window.location.pathname)
      }
      router.replace(`/pot/${pending.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 space-y-6">
      <div className="border-b-2 border-black pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
          Invite
        </p>
        <h1 className="font-display text-3xl text-black leading-tight">Import pot</h1>
      </div>

      {status === "loading" && (
        <p className="text-sm text-neutral-600">Reading invite link…</p>
      )}

      {status === "err" && (
        <div className="proof-card-flat p-5 space-y-4">
          <p className="text-sm text-black leading-relaxed">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/app">
              <Button>Go to app</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>
      )}

      {status === "confirm" && pending && (
        <div className="proof-card-flat p-5 space-y-4">
          <p className="text-sm text-black leading-relaxed">{message}</p>
          <ul className="text-sm text-neutral-600 space-y-1 font-mono text-xs">
            <li>Host {shortAddr(pending.hostAddress)}</li>
            <li>
              {pending.participants.length} player
              {pending.participants.length === 1 ? "" : "s"} · stake {pending.stake}{" "}
              {pending.currency}
            </li>
            <li>Status {pending.status}</li>
            {pending.onChain && <li>On-chain USDt mode</li>}
          </ul>
          {overwrite && (
            <p className="text-sm border-2 border-black bg-neutral-100 p-3 leading-relaxed">
              Overwrite replaces your local copy of this pot id. Cancel if you are not sure.
            </p>
          )}
          {sigWarning && (
            <p className="text-sm border-2 border-black bg-neutral-100 p-3 leading-relaxed">
              {sigWarning}
            </p>
          )}
          <p className="text-xs text-neutral-500 leading-relaxed">
            Invite links carry pot details (names, addresses, signatures). Do not post them
            publicly.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={confirmImport} disabled={busy}>
              {busy ? "Importing…" : overwrite ? "Replace and open" : "Import and open"}
            </Button>
            <Link href="/app">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      )}

      {status === "ok" && (
        <p className="text-sm text-neutral-600">{message}</p>
      )}
    </div>
  )
}

export default function ImportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center font-mono text-xs uppercase tracking-wider text-neutral-500">
          Loading…
        </div>
      }
    >
      <ImportInner />
    </Suspense>
  )
}
