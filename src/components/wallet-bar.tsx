"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SignRequest } from "@/components/sign-request"
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
import {
  assertPasscode,
  clearVault,
  createEncryptedVault,
  getUnlockedWallet,
  getVaultMeta,
  hasVault,
  isUnlocked,
  subscribeWallet,
  unlockVault,
  updateVaultMeta,
} from "@/lib/vault"

export function WalletBar() {
  const [wallet, setWallet] = useState<LocalWallet | null>(null)
  const [locked, setLocked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [showSeed, setShowSeed] = useState(false)
  const [revealPass, setRevealPass] = useState("")
  const [importOpen, setImportOpen] = useState(false)
  const [importSeed, setImportSeed] = useState("")
  const [passcode, setPasscode] = useState("")
  const [passcode2, setPasscode2] = useState("")
  const [unlockPass, setUnlockPass] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [signOpen, setSignOpen] = useState(false)
  const [pendingSeed, setPendingSeed] = useState<string | null>(null)
  const [pendingAddress, setPendingAddress] = useState<string | null>(null)
  const [pendingPass, setPendingPass] = useState<string | null>(null)
  const [usdtBal, setUsdtBal] = useState<string | null>(null)
  const usdt = getUsdtConfig()

  function refresh() {
    const unlocked = getUnlockedWallet()
    if (unlocked) {
      setWallet(unlocked)
      setLocked(false)
      return
    }
    setWallet(null)
    setLocked(hasVault())
  }

  useEffect(() => {
    const t = window.setTimeout(refresh, 0)
    const unsub = subscribeWallet(refresh)
    return () => {
      window.clearTimeout(t)
      unsub()
    }
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

  useEffect(() => {
    if (!showSeed) return
    const t = window.setTimeout(() => {
      setShowSeed(false)
      setRevealPass("")
    }, 30_000)
    return () => window.clearTimeout(t)
  }, [showSeed])

  async function prepareCreate() {
    setBusy(true)
    setError(null)
    try {
      assertPasscode(passcode)
      if (passcode !== passcode2) throw new Error("Passcodes do not match")
      const seedPhrase = generateSeedPhrase()
      const address = await getAddressFromSeed(seedPhrase)
      setPendingSeed(seedPhrase)
      setPendingAddress(address)
      setPendingPass(passcode)
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
      assertPasscode(passcode)
      if (passcode !== passcode2) throw new Error("Passcodes do not match")
      const seed = importSeed.trim()
      if (!isValidSeedPhrase(seed)) {
        setError("Need a valid 12 or 24 word seed phrase")
        return
      }
      const address = await getAddressFromSeed(seed)
      setPendingSeed(seed)
      setPendingAddress(address)
      setPendingPass(passcode)
      setSignOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed")
    } finally {
      setBusy(false)
    }
  }

  async function unlockExisting() {
    setBusy(true)
    setError(null)
    try {
      await unlockVault(unlockPass)
      setUnlockPass("")
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unlock failed")
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    clearVault()
    setWallet(null)
    setLocked(false)
    setShowSeed(false)
    setRevealPass("")
  }

  async function tryRevealSeed() {
    setError(null)
    try {
      // Re-open vault with passcode to prove user; seed already in memory if unlocked
      if (!isUnlocked()) {
        await unlockVault(revealPass)
      } else {
        // Verify passcode still correct by unlock attempt
        await unlockVault(revealPass)
      }
      setShowSeed(true)
      setRevealPass("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot reveal seed")
      setShowSeed(false)
    }
  }

  const unlockWallet: LocalWallet | null =
    pendingSeed && pendingAddress
      ? {
          address: pendingAddress,
          seedPhrase: pendingSeed,
          createdAt: new Date().toISOString(),
        }
      : null

  if (locked && !wallet) {
    const meta = getVaultMeta()
    return (
      <div className="proof-card-flat p-5 space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
            Wallet locked
          </p>
          <p className="font-display text-2xl text-black leading-tight">Enter passcode</p>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
            Seed is encrypted in this browser. Unlock to sign and transact.
            {meta ? ` Address ${shortAddr(meta.address)}.` : ""}
          </p>
        </div>
        <label className="block text-sm">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Session passcode
          </span>
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black"
            value={unlockPass}
            onChange={(e) => setUnlockPass(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={unlockExisting} disabled={busy || unlockPass.length < 8}>
            {busy ? "Unlocking…" : "Unlock wallet"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              clearVault()
              setLocked(false)
            }}
          >
            Remove vault
          </Button>
        </div>
        {error && (
          <p className="font-mono text-xs uppercase tracking-wide border-l-2 border-black pl-3">
            {error}
          </p>
        )}
        <p className="text-xs text-neutral-500 leading-relaxed">
          RPC providers see your address when balances load. Use a trusted RPC.
        </p>
      </div>
    )
  }

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
            Powered by Tether WDK. Set a session passcode so your seed is encrypted at rest.
            Nothing is sent to a Splitpot server.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <label className="block text-sm">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Passcode (min 8)
              </span>
              <input
                type="password"
                autoComplete="new-password"
                className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Confirm passcode
              </span>
              <input
                type="password"
                autoComplete="new-password"
                className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-black"
                value={passcode2}
                onChange={(e) => setPasscode2(e.target.value)}
              />
            </label>
          </div>

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
          <p className="mt-4 text-xs text-neutral-500 leading-relaxed">
            Seed is never stored as plain text. Passcode encrypts it for this browser session.
            Back up the seed offline after unlock.
          </p>
        </div>

        {unlockWallet && pendingPass && (
          <SignRequest
            open={signOpen}
            onClose={() => {
              setSignOpen(false)
              setPendingSeed(null)
              setPendingAddress(null)
              setPendingPass(null)
            }}
            wallet={unlockWallet}
            title="Activate wallet"
            subtitle="Sign this challenge with WDK to prove key control. Then we encrypt the seed with your passcode."
            message={buildWalletUnlockMessage(unlockWallet.address)}
            confirmLabel="Sign to unlock"
            onSigned={async (result) => {
              try {
                await createEncryptedVault({
                  seedPhrase: unlockWallet.seedPhrase,
                  address: unlockWallet.address,
                  passcode: pendingPass,
                  unlockSignature: result.signature,
                })
                updateVaultMeta({
                  unlockSignature: result.signature,
                  unlockedAt: new Date().toISOString(),
                })
                setSignOpen(false)
                setPendingSeed(null)
                setPendingAddress(null)
                setPendingPass(null)
                setImportOpen(false)
                setImportSeed("")
                setPasscode("")
                setPasscode2("")
                setShowSeed(false)
                refresh()
              } catch (e) {
                setError(e instanceof Error ? e.message : "Vault create failed")
              }
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
            WDK wallet · encrypted vault
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
          <p className="text-[11px] text-neutral-500 mt-2 max-w-md leading-relaxed">
            Seed encrypted at rest. RPC providers can see this address when you load balances.
          </p>
        </div>
        <div className="flex flex-col gap-2 items-stretch sm:items-end">
          {!showSeed ? (
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="password"
                placeholder="Passcode to show seed"
                className="border-2 border-black px-2 py-1.5 text-xs font-mono w-40"
                value={revealPass}
                onChange={(e) => setRevealPass(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={tryRevealSeed}>
                Show seed
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowSeed(false)}>
              Hide seed
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
      {showSeed && (
        <div className="mt-4 border-2 border-black bg-neutral-100 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 mb-2">
            Private seed · auto-hides in 30s · write offline · never share
          </p>
          <p className="font-mono text-sm text-black select-all">{wallet.seedPhrase}</p>
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
    const tick = () => setWallet(getUnlockedWallet())
    const t = window.setTimeout(tick, 0)
    const unsub = subscribeWallet(tick)
    const id = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(id)
      unsub()
    }
  }, [])
  return wallet
}
