"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SignRequest } from "@/components/sign-request"
import { clearWallet, loadWallet, saveWallet } from "@/lib/store"
import type { LocalWallet } from "@/lib/types"
import {
  buildWalletUnlockMessage,
  generateSeedPhrase,
  getAddressFromSeed,
  getUsdtBalance,
  isValidSeedPhrase,
  shortenSig,
} from "@/lib/wdk-client"
import { shortAddr } from "@/lib/pot"
import { formatTokenUnits, getUsdtConfig } from "@/lib/chain"

export function WalletBar() {
  const [wallet, setWallet] = useState<LocalWallet | null>(null)
  const [busy, setBusy] = useState(false)
  const [showSeed, setShowSeed] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importSeed, setImportSeed] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [signOpen, setSignOpen] = useState(false)
  const [pendingSeed, setPendingSeed] = useState<string | null>(null)
  const [pendingAddress, setPendingAddress] = useState<string | null>(null)
  const [usdtBal, setUsdtBal] = useState<string | null>(null)
  const usdt = getUsdtConfig()

  useEffect(() => {
    const t = window.setTimeout(() => setWallet(loadWallet()), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    const t = window.setTimeout(async () => {
      if (!wallet || !usdt) {
        if (!cancelled) setUsdtBal(null)
        return
      }
      try {
        const bal = await getUsdtBalance(wallet.seedPhrase, usdt)
        if (!cancelled) setUsdtBal(formatTokenUnits(bal, usdt.decimals))
      } catch {
        if (!cancelled) setUsdtBal(null)
      }
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [wallet, usdt])

  async function prepareCreate() {
    setBusy(true)
    setError(null)
    try {
      const seedPhrase = generateSeedPhrase()
      const address = await getAddressFromSeed(seedPhrase)
      setPendingSeed(seedPhrase)
      setPendingAddress(address)
      setSignOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create wallet")
    } finally {
      setBusy(false)
    }
  }

  async function prepareImport() {
    setBusy(true)
    setError(null)
    try {
      const seed = importSeed.trim()
      if (!isValidSeedPhrase(seed)) {
        setError("Need a valid 12 or 24 word seed phrase")
        return
      }
      const address = await getAddressFromSeed(seed)
      setPendingSeed(seed)
      setPendingAddress(address)
      setSignOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed")
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    clearWallet()
    setWallet(null)
    setShowSeed(false)
  }

  const unlockWallet: LocalWallet | null =
    pendingSeed && pendingAddress
      ? {
          address: pendingAddress,
          seedPhrase: pendingSeed,
          createdAt: new Date().toISOString(),
        }
      : null

  if (!wallet) {
    return (
      <>
        <div className="proof-card-flat p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
            Wallet
          </p>
          <p className="font-display text-2xl text-black mb-2 leading-tight">
            Self-custodial
          </p>
          <p className="text-sm text-neutral-600 mb-5 leading-relaxed">
            Powered by Tether WDK. Create or import a seed, then sign a challenge to prove you
            control the keys. Nothing is sent to a server.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={prepareCreate} disabled={busy}>
              {busy ? "Preparing…" : "Create WDK wallet"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setImportOpen((v) => !v)}
              disabled={busy}
            >
              Import seed
            </Button>
          </div>
          {importOpen && (
            <div className="mt-4 space-y-2 border-t-2 border-black pt-4">
              <textarea
                className="w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono"
                rows={3}
                placeholder="twelve word seed phrase…"
                value={importSeed}
                onChange={(e) => setImportSeed(e.target.value)}
              />
              <Button size="sm" onClick={prepareImport} disabled={busy}>
                Continue to sign
              </Button>
            </div>
          )}
          {error && (
            <p className="mt-3 font-mono text-xs uppercase tracking-wide text-black border-l-2 border-black pl-3">
              {error}
            </p>
          )}
        </div>

        {unlockWallet && (
          <SignRequest
            open={signOpen}
            onClose={() => {
              setSignOpen(false)
              setPendingSeed(null)
              setPendingAddress(null)
            }}
            wallet={unlockWallet}
            title="Activate wallet"
            subtitle="Sign this challenge with WDK to prove key control. Required before using Splitpot."
            message={buildWalletUnlockMessage(unlockWallet.address)}
            confirmLabel="Sign to unlock"
            onSigned={(result) => {
              const w: LocalWallet = {
                ...unlockWallet,
                unlockSignature: result.signature,
                unlockedAt: new Date().toISOString(),
              }
              saveWallet(w)
              setWallet(w)
              setShowSeed(true)
              setSignOpen(false)
              setPendingSeed(null)
              setPendingAddress(null)
              setImportOpen(false)
              setImportSeed("")
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="proof-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            WDK wallet · unlocked
          </p>
          <p className="font-mono text-sm text-black mt-1">{shortAddr(wallet.address)}</p>
          <p className="font-mono text-[10px] text-neutral-500 break-all mt-1">
            {wallet.address}
          </p>
          {wallet.unlockSignature && (
            <p className="font-mono text-[10px] text-neutral-500 mt-1">
              unlock {shortenSig(wallet.unlockSignature, 8)}
            </p>
          )}
          {usdt && usdtBal != null && (
            <p className="font-mono text-xs text-black mt-2">
              {usdtBal} {usdt.symbol}
              <span className="text-neutral-500"> · {usdt.chainName}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSeed((v) => !v)}>
            {showSeed ? "Hide seed" : "Show seed"}
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
      {showSeed && (
        <div className="mt-4 border-2 border-black bg-neutral-100 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 mb-2">
            Backup now · session only · never share
          </p>
          <p className="font-mono text-sm text-black">{wallet.seedPhrase}</p>
        </div>
      )}
      {error && (
        <p className="mt-3 font-mono text-xs uppercase tracking-wide text-black border-l-2 border-black pl-3">
          {error}
        </p>
      )}
    </div>
  )
}

export function useWallet(): LocalWallet | null {
  const [wallet, setWallet] = useState<LocalWallet | null>(null)
  useEffect(() => {
    const tick = () => setWallet(loadWallet())
    const t = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(id)
    }
  }, [])
  return wallet
}
