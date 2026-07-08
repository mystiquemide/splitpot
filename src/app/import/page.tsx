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
        setMessage("Missing share payload")
        return
      }
      const pot = decodePotShare(d)
      if (!pot || !pot.id) {
        setStatus("err")
        setMessage("Invalid share link")
        return
      }
      savePot(pot)
      setStatus("ok")
      setMessage(`Imported ${pot.title}`)
      router.replace(`/pot/${pot.id}`)
    }, 0)
    return () => window.clearTimeout(t)
  }, [params, router])

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
      <h1 className="text-xl font-semibold text-white">Import pot</h1>
      {status === "idle" && <p className="text-gray-400">Importing…</p>}
      {status === "err" && (
        <>
          <p className="text-red-400">{message}</p>
          <Link href="/">
            <Button>Home</Button>
          </Link>
        </>
      )}
      {status === "ok" && <p className="text-emerald-400">{message}</p>}
    </div>
  )
}

export default function ImportPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">Loading…</div>}>
      <ImportInner />
    </Suspense>
  )
}
