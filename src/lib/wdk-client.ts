/**
 * WDK (Wallet Development Kit by Tether) client helpers.
 * All keys stay in the browser. Seed never hits a server.
 */
import WDK from "@tetherto/wdk"
import WalletManagerEvm, {
  WalletAccountReadOnlyEvm,
} from "@tetherto/wdk-wallet-evm"
import { SeedSignerEvm } from "@tetherto/wdk-wallet-evm/signers"

export const RPC =
  process.env.NEXT_PUBLIC_EVM_RPC_URL || "https://sepolia.drpc.org"

type EvmAccount = {
  getAddress: () => Promise<string>
  sign: (message: string) => Promise<string>
  sendTransaction: (tx: {
    to: string
    value: bigint
  }) => Promise<{ hash: string }>
  getBalance: () => Promise<bigint>
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

/** @deprecated use signMessageWithWdk */
export async function signJoinMessage(
  seedPhrase: string,
  message: string
): Promise<string> {
  return signMessageWithWdk(seedPhrase, message)
}

/**
 * Verify a signature against an address using WDK read-only account.
 * This is real crypto verification, not a UI checkbox.
 */
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
}): string {
  const lines = [
    "Splitpot — lock your matchday pick",
    "",
    "You are signing to join a prediction pot.",
    "This proves you control this wallet. It does not move funds by itself.",
    "",
    `Pot ID: ${params.potId}`,
  ]
  if (params.potTitle) lines.push(`Pot: ${params.potTitle}`)
  if (params.homeTeam && params.awayTeam) {
    lines.push(`Match: ${params.homeTeam} vs ${params.awayTeam}`)
  }
  lines.push(
    `Pick: ${params.pickLabel || params.pick}`,
    `Stake: ${params.stake} USDt (commitment)`,
    `Wallet: ${params.address}`,
    "",
    "If you did not request this, reject and never share your seed."
  )
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

export async function sendNativePayout(
  seedPhrase: string,
  to: string,
  amountWei: bigint
): Promise<{ hash: string }> {
  return withAccount(seedPhrase, async (account) => {
    const result = await account.sendTransaction({ to, value: amountWei })
    return { hash: result.hash }
  })
}

export async function getNativeBalance(seedPhrase: string): Promise<bigint> {
  return withAccount(seedPhrase, async (account) => account.getBalance())
}

export function shortenSig(sig: string, n = 10): string {
  if (!sig || sig.length < n * 2) return sig
  return `${sig.slice(0, n)}…${sig.slice(-n)}`
}
