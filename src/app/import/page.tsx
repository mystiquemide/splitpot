"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { decodePotShare, savePot } from "@/lib/store"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function ImportInner() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const t = window.setTimeout(() => {
      const d = params.get("d")
      if (!d) {
        setStatus("err")
        setMessage("This link is missing pot data. Ask the host for a new share link.")
        return
      }
      const pot = decodePotShare(d)
      if (!pot || !pot.id) {
        setStatus("err")
        setMessage("This share link is invalid or incomplete.")
        return
      }
      savePot(pot)
      setStatus("ok")
      setMessage(`Loaded “${pot.title}”. Opening pot…`)
      router.replace(`/pot/${pot.id}`)
    }, 0)
    return () => window.clearTimeout(t)
  }, [params, router])

  return (
    <div className="mx-auto max-w-lg px-4 py-16 space-y-6">
      <div className="border-b-2 border-black pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
          Share link
        </p>
        <h1 className="font-display text-3xl text-black leading-tight">Import pot</h1>
      </div>
      {status === "idle" && (
        <p className="text-sm text-neutral-600">Loading pot from this link…</p>
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
