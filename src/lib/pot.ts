import type { MatchSide, Participant, Pot } from "./types"

export function createPotId(): string {
  return `pot_${Math.random().toString(36).slice(2, 10)}`
}

export function shortAddr(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function sideLabel(side: MatchSide, pot: Pick<Pot, "homeTeam" | "awayTeam">): string {
  if (side === "home") return pot.homeTeam
  if (side === "away") return pot.awayTeam
  return "Draw"
}

export function totalPool(pot: Pot): number {
  return pot.participants.reduce((sum, p) => sum + p.stake, 0)
}

export function winners(pot: Pot): Participant[] {
  if (!pot.result) return []
  return pot.participants.filter((p) => p.pick === pot.result)
}

/** Equal split of pool among winners. Remainder cents go to first winner. */
export function payoutPlan(pot: Pot): { address: string; name: string; amount: number }[] {
  const pool = totalPool(pot)
  const w = winners(pot)
  if (w.length === 0 || pool === 0) return []

  const base = Math.floor((pool * 100) / w.length) / 100
  let remainder = Math.round((pool - base * w.length) * 100) / 100

  return w.map((p, i) => {
    let amount = base
    if (i === 0) {
      amount = Math.round((amount + remainder) * 100) / 100
      remainder = 0
    }
    return { address: p.address, name: p.name, amount }
  })
}

export function canJoin(pot: Pot, address: string): string | null {
  if (pot.status !== "open") return "Pot is not open for joins"
  if (pot.participants.some((p) => p.address.toLowerCase() === address.toLowerCase())) {
    return "This wallet already joined"
  }
  return null
}

export function sampleMatches() {
  return [
    { homeTeam: "England", awayTeam: "Spain", title: "Final watch-party pot" },
    { homeTeam: "Brazil", awayTeam: "Argentina", title: "Derby night pot" },
    { homeTeam: "France", awayTeam: "Germany", title: "Pub table pot" },
    { homeTeam: "Nigeria", awayTeam: "Morocco", title: "AFCON vibes pot" },
  ] as const
}
