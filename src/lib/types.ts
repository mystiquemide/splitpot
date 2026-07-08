export type PotStatus = "open" | "locked" | "settled"

export type MatchSide = "home" | "away" | "draw"

export interface Participant {
  address: string
  name: string
  pick: MatchSide
  /** Stake amount in whole USDt units (display). Commitment recorded in the pot. */
  stake: number
  joinedAt: string
  /** WDK personal_sign hex. Proves self-custodial control. */
  signature: string
  /** True when signature verified with WDK read-only verify() */
  verified?: boolean
  /** Exact message that was signed (for re-verify) */
  signedMessage?: string
  paidOut?: boolean
  payoutTxHash?: string
}

export interface Pot {
  id: string
  title: string
  homeTeam: string
  awayTeam: string
  /** Kickoff ISO string */
  kickoff: string
  stake: number
  currency: "USDt"
  hostAddress: string
  status: PotStatus
  participants: Participant[]
  /** Winning side after host settles */
  result?: MatchSide
  /** Host settle signature */
  settleSignature?: string
  settleMessage?: string
  createdAt: string
  settledAt?: string
}

export interface LocalWallet {
  address: string
  /** Seed kept in sessionStorage only. Never send to a server. */
  seedPhrase: string
  createdAt: string
  /** Optional unlock proof from first sign */
  unlockSignature?: string
  unlockedAt?: string
}
