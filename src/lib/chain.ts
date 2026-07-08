/**
 * On-chain USDt config. RPC and token must be on the same network.
 */

export type UsdtConfig = {
  address: string
  decimals: number
  symbol: string
  explorerTx: string
  chainName: string
  rpc: string
}

export function getUsdtConfig(): UsdtConfig | null {
  const address = process.env.NEXT_PUBLIC_USDT_ADDRESS?.trim()
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return null
  }
  const decimals = Number(process.env.NEXT_PUBLIC_USDT_DECIMALS || "6")
  return {
    address,
    decimals: Number.isFinite(decimals) ? decimals : 6,
    symbol: process.env.NEXT_PUBLIC_USDT_SYMBOL?.trim() || "USDt",
    explorerTx:
      process.env.NEXT_PUBLIC_EXPLORER_TX_URL?.trim() ||
      "https://etherscan.io/tx/",
    chainName: process.env.NEXT_PUBLIC_CHAIN_NAME?.trim() || "EVM",
    rpc: process.env.NEXT_PUBLIC_EVM_RPC_URL?.trim() || "https://sepolia.drpc.org",
  }
}

export function isOnChainConfigured(): boolean {
  return getUsdtConfig() !== null
}

/** Human amount (e.g. 10.5) → token base units */
export function toTokenUnits(amount: number, decimals: number): bigint {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid amount")
  }
  const [whole, frac = ""] = amount.toFixed(decimals).split(".")
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals)
  const base = BigInt(10) ** BigInt(decimals)
  return BigInt(whole) * base + BigInt(fracPadded || "0")
}

export function formatTokenUnits(units: bigint, decimals: number): string {
  const zero = BigInt(0)
  const neg = units < zero
  const v = neg ? -units : units
  const base = BigInt(10) ** BigInt(decimals)
  const whole = v / base
  const frac = (v % base).toString().padStart(decimals, "0").replace(/0+$/, "")
  const body = frac ? `${whole}.${frac}` : whole.toString()
  return neg ? `-${body}` : body
}

export function txUrl(hash: string, explorerTx: string): string {
  const base = explorerTx.endsWith("/") ? explorerTx : `${explorerTx}/`
  return `${base}${hash}`
}
