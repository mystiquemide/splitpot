/**
 * WDK (Wallet Development Kit by Tether) client helpers.
 * All keys stay in the browser. Seed never hits a server.
 */
import WDK from "@tetherto/wdk"
import WalletManagerEvm, {
  WalletAccountReadOnlyEvm,
} from "@tetherto/wdk-wallet-evm"
import { SeedSignerEvm } from "@tetherto/wdk-wallet-evm/signers"
import { getEvmRpcUrl, getUsdtConfig, toTokenUnits, type UsdtConfig } from "./chain"

export const RPC = getEvmRpcUrl()

type EvmAccount = {
  getAddress: () => Promise<string>
  sign: (message: string) => Promise<string>
  sendTransaction: (tx: {
    to: string
    value: bigint
  }) => Promise<{ hash: string }>
  transfer: (params: {
    token: string
    recipient: string
    amount: bigint
  }) => Promise<{ hash: string; fee?: bigint }>
  quoteTransfer?: (params: {
    token: string
    recipient: string
    amount: bigint
  }) => Promise<{ fee: bigint }>
  getBalance: () => Promise<bigint>
  getTokenBalance: (token: string) => Promise<bigint>
  dispose?: () => void
}

async function withAccount<T>(
  seedPhrase: string,
  fn: (account: EvmAccount, wallet: WalletManagerEvm) => Promise<T>
): Promise<T> {
  const root = new SeedSignerEvm(seedPhrase.trim())
  const wallet = new WalletManagerEvm(root, { provider: RPC })
  try {
    const account = (await wallet.getAccount(0)) as unknown as EvmAccount
    return await fn(account, wallet)
  } finally {
    wallet.dispose()
  }
}

export function generateSeedPhrase(): string {
  return WDK.getRandomSeedPhrase()
}

export function isValidSeedPhrase(seed: string): boolean {
  const words = seed.trim().split(/\s+/).filter(Boolean)
  return words.length === 12 || words.length === 24
}

export async function getAddressFromSeed(seedPhrase: string): Promise<string> {
  return withAccount(seedPhrase, async (account) => account.getAddress())
}

/**
 * EIP-191 personal_sign via WDK account.sign().
 * Call only after the user explicitly confirms in the UI.
 */
export async function signMessageWithWdk(
  seedPhrase: string,
  message: string
): Promise<string> {
  return withAccount(seedPhrase, async (account) => account.sign(message))
}

export async function signJoinMessage(
  seedPhrase: string,
  message: string
): Promise<string> {
  return signMessageWithWdk(seedPhrase, message)
}

export async function verifySignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const readOnly = new WalletAccountReadOnlyEvm(address, { provider: RPC })
    const ok = await (
      readOnly as unknown as {
        verify: (msg: string, sig: string) => Promise<boolean>
      }
    ).verify(message, signature)
    return Boolean(ok)
  } catch {
    return false
  }
}

export function buildJoinMessage(params: {
  potId: string
  potTitle?: string
  homeTeam?: string
  awayTeam?: string
  pick: string
  pickLabel?: string
  stake: number
  address: string
  onChain?: boolean
  tokenAddress?: string
}): string {
  const lines = [
    "Splitpot — lock your matchday pick",
    "",
    "You are locking your pick for a Splitpot match pot.",
    "This proves you control this wallet.",
    "",
    `Pot: ${params.potTitle || params.potId}`,
  ]
  if (params.homeTeam && params.awayTeam) {
    lines.push(`Match: ${params.homeTeam} vs ${params.awayTeam}`)
  }
  lines.push(
    `Pick: ${params.pickLabel || params.pick}`,
    `Stake: ${params.stake} USDt`,
    `Wallet: ${params.address}`
  )
  if (params.onChain && params.tokenAddress) {
    lines.push(
      "",
      "Next step: send the stake as USDt to the host wallet.",
      `Token: ${params.tokenAddress}`
    )
  } else {
    lines.push("", "This signature does not move funds by itself.")
  }
  lines.push("", "If you did not start this, cancel and never share your seed.")
  return lines.join("\n")
}

export function buildWalletUnlockMessage(address: string): string {
  return [
    "Splitpot — prove wallet control",
    "",
    "Sign this message to activate your self-custodial WDK wallet in this browser.",
    "No funds will be transferred.",
    "",
    `Wallet: ${address}`,
    `Time: ${new Date().toISOString()}`,
  ].join("\n")
}

export function buildSettleMessage(params: {
  potId: string
  result: string
  resultLabel: string
  address: string
}): string {
  return [
    "Splitpot — host settle result",
    "",
    "You are the host. Signing commits the full-time result for this pot.",
    "",
    `Pot ID: ${params.potId}`,
    `Result: ${params.resultLabel} (${params.result})`,
    `Host wallet: ${params.address}`,
    `Time: ${new Date().toISOString()}`,
  ].join("\n")
}

export function buildTransferSummary(params: {
  kind: "deposit" | "payout"
  amount: number
  symbol: string
  to: string
  potId: string
  token: string
  chainName: string
}): string {
  const title =
    params.kind === "deposit"
      ? "Splitpot — send stake (USDt)"
      : "Splitpot — pay winner (USDt)"
  return [
    title,
    "",
    `Amount: ${params.amount} ${params.symbol}`,
    `To: ${params.to}`,
    `Token: ${params.token}`,
    `Network: ${params.chainName}`,
    `Pot: ${params.potId}`,
    "",
    "This broadcasts an on-chain ERC-20 transfer via Tether WDK.",
    "You need enough token balance and native gas for fees.",
  ].join("\n")
}

export async function getNativeBalance(seedPhrase: string): Promise<bigint> {
  return withAccount(seedPhrase, async (account) => account.getBalance())
}

export async function getUsdtBalance(
  seedPhrase: string,
  config?: UsdtConfig | null
): Promise<bigint> {
  const cfg = config ?? getUsdtConfig()
  if (!cfg) throw new Error("USDt is not configured")
  return withAccount(seedPhrase, async (account) =>
    account.getTokenBalance(cfg.address)
  )
}

export async function getUsdtBalanceByAddress(
  address: string,
  config?: UsdtConfig | null
): Promise<bigint> {
  const cfg = config ?? getUsdtConfig()
  if (!cfg) throw new Error("USDt is not configured")
  const readOnly = new WalletAccountReadOnlyEvm(address, { provider: RPC })
  return (
    readOnly as unknown as { getTokenBalance: (t: string) => Promise<bigint> }
  ).getTokenBalance(cfg.address)
}

/**
 * On-chain ERC-20 transfer via WDK. Only call after user confirms in UI.
 */
export async function transferUsdt(params: {
  seedPhrase: string
  to: string
  amountHuman: number
  config?: UsdtConfig | null
}): Promise<{ hash: string; amountUnits: bigint }> {
  const cfg = params.config ?? getUsdtConfig()
  if (!cfg) throw new Error("USDt is not configured (set NEXT_PUBLIC_USDT_ADDRESS)")
  if (!/^0x[a-fA-F0-9]{40}$/.test(params.to)) {
    throw new Error("Invalid recipient address")
  }
  const amountUnits = toTokenUnits(params.amountHuman, cfg.decimals)
  if (amountUnits <= BigInt(0)) throw new Error("Amount must be greater than zero")

  return withAccount(params.seedPhrase, async (account) => {
    const balance = await account.getTokenBalance(cfg.address)
    if (balance < amountUnits) {
      throw new Error(
        `Insufficient ${cfg.symbol} balance (have ${balance.toString()} base units, need ${amountUnits.toString()})`
      )
    }
    const result = await account.transfer({
      token: cfg.address,
      recipient: params.to,
      amount: amountUnits,
    })
    if (!result?.hash) throw new Error("Transfer returned no transaction hash")
    return { hash: result.hash as string, amountUnits }
  })
}

export async function quoteUsdtTransfer(params: {
  seedPhrase: string
  to: string
  amountHuman: number
  config?: UsdtConfig | null
}): Promise<{ fee?: bigint } | null> {
  const cfg = params.config ?? getUsdtConfig()
  if (!cfg) return null
  const amountUnits = toTokenUnits(params.amountHuman, cfg.decimals)
  try {
    return await withAccount(params.seedPhrase, async (account) => {
      if (!account.quoteTransfer) return null
      const q = await account.quoteTransfer({
        token: cfg.address,
        recipient: params.to,
        amount: amountUnits,
      })
      return { fee: q.fee }
    })
  } catch {
    return null
  }
}

export function shortenSig(sig: string, n = 10): string {
  if (!sig || sig.length < n * 2) return sig
  return `${sig.slice(0, n)}…${sig.slice(-n)}`
}
