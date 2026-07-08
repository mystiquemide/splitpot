"use client"

import { use } from "react"
import { PotRoom } from "@/components/pot-room"
import { WalletBar } from "@/components/wallet-bar"

export default function PotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-8">
      <WalletBar />
      <PotRoom potId={id} />
    </div>
  )
}
