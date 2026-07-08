export type PotStatus = "open" | "locked" | "settled"

export type MatchSide = "home" | "away" | "draw"

export interface Participant {
  address: string
  name: string
  pick: MatchSide
  /** Stake amount in whole USDt units (display). */
  stake: number
  joinedAt: string
  /** WDK personal_sign hex. Proves self-custodial control. */
  signature: string
  /** True when signature verified with WDK read-only verify() */
  verified?: boolean
  /** Exact message that was signed (for re-verify) */
  signedMessage?: string
  /** On-chain stake deposit to host (if pot.onChain) */
  depositTxHash?: string
  depositConfirmed?: boolean
  paidOut?: boolean
  payoutTxHash?: string
}

export interface Pot {
  id: string
  title: string
  homeTeam: string
  awayTeam: string
  kickoff: string
  stake: number
  currency: "USDt"
  hostAddress: string
  status: PotStatus
  participants: Participant[]
  /** When true, stakes and payouts use WDK ERC-20 USDt transfers */
  onChain?: boolean
  /** Token contract used for this pot (copied from env at create time) */
  tokenAddress?: string
  chainName?: string
  result?: MatchSide
  settleSignature?: string
  settleMessage?: string
  createdAt: string
  settledAt?: string
}

export interface LocalWallet {
  address: string
  seedPhrase: string
  createdAt: string
  unlockSignature?: string
  unlockedAt?: string
}
