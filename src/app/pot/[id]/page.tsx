"use client"

import { use } from "react"
import { PotRoom } from "@/components/pot-room"
import { WalletBar } from "@/components/wallet-bar"

export default function PotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <WalletBar />
      <PotRoom potId={id} />
    </div>
  )
}
