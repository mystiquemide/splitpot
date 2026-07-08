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
  isValidSeedPhrase,
  shortenSig,
} from "@/lib/wdk-client"
import { shortAddr } from "@/lib/pot"

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

  useEffect(() => {
    setWallet(loadWallet())
  }, [])

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
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <p className="text-sm font-medium text-white mb-1">Self-custodial wallet</p>
          <p className="text-sm text-gray-400 mb-4">
            Powered by <span className="text-emerald-400">Tether WDK</span>. Create or import a
            seed, then <strong className="text-gray-200 font-medium">sign a challenge</strong> to
            prove you control the keys. Nothing is sent to a server.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={prepareCreate} disabled={busy} className="rounded-full">
              {busy ? "Preparing…" : "Create WDK wallet"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setImportOpen((v) => !v)}
              disabled={busy}
              className="rounded-full"
            >
              Import seed
            </Button>
          </div>
          {importOpen && (
            <div className="mt-3 space-y-2">
              <textarea
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm"
                rows={3}
                placeholder="twelve word seed phrase…"
                value={importSeed}
                onChange={(e) => setImportSeed(e.target.value)}
              />
              <Button size="sm" onClick={prepareImport} disabled={busy} className="rounded-full">
                Continue to sign
              </Button>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
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
    <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-500">WDK wallet · unlocked</p>
          <p className="font-mono text-sm text-white">{shortAddr(wallet.address)}</p>
          <p className="text-xs text-gray-500 break-all mt-1">{wallet.address}</p>
          {wallet.unlockSignature && (
            <p className="text-xs text-emerald-500/80 mt-1 font-mono">
              unlock sig {shortenSig(wallet.unlockSignature, 8)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSeed((v) => !v)}
            className="rounded-full"
          >
            {showSeed ? "Hide seed" : "Show seed"}
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            Clear
          </Button>
        </div>
      </div>
      {showSeed && (
        <div className="mt-3 rounded-lg border border-amber-800/60 bg-amber-950/30 p-3">
          <p className="text-xs text-amber-400 mb-1">Backup now. Session only. Never share.</p>
          <p className="font-mono text-sm text-amber-100">{wallet.seedPhrase}</p>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}

export function useWallet(): LocalWallet | null {
  const [wallet, setWallet] = useState<LocalWallet | null>(null)
  useEffect(() => {
    setWallet(loadWallet())
    const id = setInterval(() => setWallet(loadWallet()), 1000)
    return () => clearInterval(id)
  }, [])
  return wallet
}
