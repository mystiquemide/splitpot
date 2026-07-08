export type PotStatus = "open" | "locked" | "settled"

export type MatchSide = "home" | "away" | "draw"

export interface Participant {
  address: string
  name: string
  pick: MatchSide
  /** Stake amount in whole USDt units (display). Commitment is local for demo. */
  stake: number
  joinedAt: string
  /** WDK-signed join attestation (hex). Proves self-custodial control. */
  signature: string
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
  createdAt: string
  settledAt?: string
}

export interface LocalWallet {
  address: string
  /** Demo only: seed kept in sessionStorage. Never send to a server. */
  seedPhrase: string
  createdAt: string
}
