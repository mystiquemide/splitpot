/**
 * Encrypted session vault for seed phrases.
 * Seed is never written to sessionStorage in plaintext.
 * After unlock, seed lives only in process memory until Sign out or tab close.
 */

export type VaultMeta = {
  address: string
  createdAt: string
  unlockSignature?: string
  unlockedAt?: string
}

type StoredVault = {
  v: 1
  address: string
  createdAt: string
  unlockSignature?: string
  unlockedAt?: string
  salt: string
  iv: string
  ciphertext: string
}

const VAULT_KEY = "splitpot_vault_v1"
const LEGACY_WALLET_KEY = "splitpot_wallet"

let memorySeed: string | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function subscribeWallet(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function bufToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let s = ""
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!)
  return btoa(s)
}

function b64ToBuf(b64: string): ArrayBuffer {
  const s = atob(b64)
  const bytes = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i)
  return bytes.buffer
}

async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const base = await crypto.subtle.importKey(
    "raw",
    enc.encode(passcode),
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  // Copy into a fresh ArrayBuffer-backed view for TS DOM lib compatibility
  const saltCopy = new Uint8Array(salt)
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltCopy,
      iterations: 210_000,
      hash: "SHA-256",
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export function hasVault(): boolean {
  if (typeof window === "undefined") return false
  // Migrate away from legacy plaintext wallet if present
  try {
    sessionStorage.removeItem(LEGACY_WALLET_KEY)
  } catch {
    /* ignore */
  }
  return Boolean(sessionStorage.getItem(VAULT_KEY))
}

export function isUnlocked(): boolean {
  return memorySeed !== null
}

export function getMemorySeed(): string | null {
  return memorySeed
}

export function getVaultMeta(): VaultMeta | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(VAULT_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as StoredVault
    if (v.v !== 1 || !v.address) return null
    return {
      address: v.address,
      createdAt: v.createdAt,
      unlockSignature: v.unlockSignature,
      unlockedAt: v.unlockedAt,
    }
  } catch {
    return null
  }
}

export function getUnlockedWallet(): (VaultMeta & { seedPhrase: string }) | null {
  const meta = getVaultMeta()
  if (!meta || !memorySeed) return null
  return { ...meta, seedPhrase: memorySeed }
}

export async function createEncryptedVault(params: {
  seedPhrase: string
  address: string
  passcode: string
  unlockSignature?: string
}): Promise<void> {
  if (params.passcode.length < 8) {
    throw new Error("Passcode must be at least 8 characters")
  }
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(params.passcode, salt)
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(params.seedPhrase.trim())
  )
  const stored: StoredVault = {
    v: 1,
    address: params.address,
    createdAt: new Date().toISOString(),
    unlockSignature: params.unlockSignature,
    unlockedAt: new Date().toISOString(),
    salt: bufToB64(salt.buffer),
    iv: bufToB64(iv.buffer),
    ciphertext: bufToB64(ciphertext),
  }
  sessionStorage.setItem(VAULT_KEY, JSON.stringify(stored))
  memorySeed = params.seedPhrase.trim()
  notify()
}

export async function unlockVault(passcode: string): Promise<VaultMeta & { seedPhrase: string }> {
  const raw = sessionStorage.getItem(VAULT_KEY)
  if (!raw) throw new Error("No wallet vault on this device")
  const stored = JSON.parse(raw) as StoredVault
  const salt = new Uint8Array(b64ToBuf(stored.salt))
  const iv = new Uint8Array(b64ToBuf(stored.iv))
  const key = await deriveKey(passcode, salt)
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      b64ToBuf(stored.ciphertext)
    )
    const seedPhrase = new TextDecoder().decode(plain)
    memorySeed = seedPhrase
    stored.unlockedAt = new Date().toISOString()
    sessionStorage.setItem(VAULT_KEY, JSON.stringify(stored))
    notify()
    return {
      address: stored.address,
      createdAt: stored.createdAt,
      unlockSignature: stored.unlockSignature,
      unlockedAt: stored.unlockedAt,
      seedPhrase,
    }
  } catch {
    throw new Error("Wrong passcode")
  }
}

export function updateVaultMeta(patch: Partial<VaultMeta>): void {
  const raw = sessionStorage.getItem(VAULT_KEY)
  if (!raw) return
  const stored = JSON.parse(raw) as StoredVault
  if (patch.unlockSignature !== undefined) stored.unlockSignature = patch.unlockSignature
  if (patch.unlockedAt !== undefined) stored.unlockedAt = patch.unlockedAt
  sessionStorage.setItem(VAULT_KEY, JSON.stringify(stored))
  notify()
}

export function lockVaultMemory(): void {
  memorySeed = null
  notify()
}

export function clearVault(): void {
  memorySeed = null
  try {
    sessionStorage.removeItem(VAULT_KEY)
    sessionStorage.removeItem(LEGACY_WALLET_KEY)
  } catch {
    /* ignore */
  }
  notify()
}

export function assertPasscode(passcode: string): void {
  if (passcode.length < 8) {
    throw new Error("Passcode must be at least 8 characters")
  }
}
