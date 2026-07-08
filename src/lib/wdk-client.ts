/**
 * WDK (Wallet Development Kit by Tether) client helpers.
 * All keys stay in the browser. Seed never hits a server.
 */
import WDK from "@tetherto/wdk"
import WalletManagerEvm from "@tetherto/wdk-wallet-evm"
import { SeedSignerEvm } from "@tetherto/wdk-wallet-evm/signers"

const RPC =
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

/** Sign a join attestation with the user's WDK account (self-custody proof). */
export async function signJoinMessage(
  seedPhrase: string,
  message: string
): Promise<string> {
  return withAccount(seedPhrase, async (account) => account.sign(message))
}

export function buildJoinMessage(params: {
  potId: string
  pick: string
  stake: number
  address: string
}): string {
  return [
    "Splitpot join",
    `pot:${params.potId}`,
    `pick:${params.pick}`,
    `stake:${params.stake}`,
    `addr:${params.address}`,
  ].join("|")
}

/**
 * Send native Sepolia ETH as a payout demo when the host has test funds.
 */
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
