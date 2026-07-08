"use client"

import type { LocalWallet, Pot } from "./types"

const WALLET_KEY = "splitpot_wallet"
const POTS_KEY = "splitpot_pots"

export function loadWallet(): LocalWallet | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(WALLET_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LocalWallet
  } catch {
    return null
  }
}

export function saveWallet(wallet: LocalWallet): void {
  sessionStorage.setItem(WALLET_KEY, JSON.stringify(wallet))
}

export function clearWallet(): void {
  sessionStorage.removeItem(WALLET_KEY)
}

export function loadPots(): Pot[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(POTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Pot[]
  } catch {
    return []
  }
}

export function savePot(pot: Pot): void {
  const pots = loadPots()
  const idx = pots.findIndex((p) => p.id === pot.id)
  if (idx >= 0) pots[idx] = pot
  else pots.unshift(pot)
  localStorage.setItem(POTS_KEY, JSON.stringify(pots))
}

export function getPot(id: string): Pot | null {
  return loadPots().find((p) => p.id === id) ?? null
}

export function deletePot(id: string): void {
  const pots = loadPots().filter((p) => p.id !== id)
  localStorage.setItem(POTS_KEY, JSON.stringify(pots))
}

/** Encode pot into a shareable URL hash so a friend can import it. */
export function encodePotShare(pot: Pot): string {
  const json = JSON.stringify(pot)
  return typeof btoa !== "undefined"
    ? btoa(unescape(encodeURIComponent(json)))
    : Buffer.from(json, "utf8").toString("base64")
}

export function decodePotShare(encoded: string): Pot | null {
  try {
    const json =
      typeof atob !== "undefined"
        ? decodeURIComponent(escape(atob(encoded)))
        : Buffer.from(encoded, "base64").toString("utf8")
    return JSON.parse(json) as Pot
  } catch {
    return null
  }
}
