"use client"

import type { MatchSide, Participant, Pot } from "./types"
import { verifySignature } from "./wdk-client"

const POTS_KEY = "splitpot_pots"

export function loadPots(): Pot[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(POTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPotShape) as Pot[]
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

export function potExists(id: string): boolean {
  return getPot(id) !== null
}

function isMatchSide(v: unknown): v is MatchSide {
  return v === "home" || v === "away" || v === "draw"
}

function isParticipantShape(p: unknown): p is Participant {
  if (!p || typeof p !== "object") return false
  const o = p as Record<string, unknown>
  return (
    typeof o.address === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(o.address) &&
    typeof o.name === "string" &&
    o.name.length > 0 &&
    o.name.length <= 64 &&
    isMatchSide(o.pick) &&
    typeof o.stake === "number" &&
    Number.isFinite(o.stake) &&
    o.stake >= 0 &&
    typeof o.signature === "string" &&
    o.signature.length > 0
  )
}

export function isPotShape(v: unknown): v is Pot {
  if (!v || typeof v !== "object") return false
  const o = v as Record<string, unknown>
  if (typeof o.id !== "string" || !o.id.startsWith("pot_")) return false
  if (typeof o.title !== "string" || !o.title.trim()) return false
  if (typeof o.homeTeam !== "string" || typeof o.awayTeam !== "string") return false
  if (typeof o.stake !== "number" || !(o.stake > 0)) return false
  if (o.currency !== "USDt") return false
  if (typeof o.hostAddress !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(o.hostAddress)) {
    return false
  }
  if (o.status !== "open" && o.status !== "locked" && o.status !== "settled") return false
  if (!Array.isArray(o.participants) || !o.participants.every(isParticipantShape)) return false
  if (o.participants.length > 64) return false
  return true
}

/** Minimal share snapshot (no host-only secrets; still contains public pot fields). */
export type PotSharePayload = {
  v: 1
  pot: Pot
}

export function toSharePayload(pot: Pot): PotSharePayload {
  // Drop nothing required for join/verify; keep pot as-is but mark version
  return { v: 1, pot }
}

export function encodePotShare(pot: Pot): string {
  const json = JSON.stringify(toSharePayload(pot))
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
    const data = JSON.parse(json) as unknown
    // Support legacy bare pot JSON
    if (isPotShape(data)) return data
    if (data && typeof data === "object" && (data as PotSharePayload).v === 1) {
      const pot = (data as PotSharePayload).pot
      if (isPotShape(pot)) return pot
    }
    return null
  } catch {
    return null
  }
}

export async function verifyPotSignatures(pot: Pot): Promise<{
  ok: boolean
  failed: string[]
}> {
  const failed: string[] = []
  for (const p of pot.participants) {
    if (!p.signedMessage) continue
    const valid = await verifySignature(p.address, p.signedMessage, p.signature)
    if (!valid) failed.push(p.address)
  }
  return { ok: failed.length === 0, failed }
}

/** Canonical app origin for invite links. Prefer env, then window. */
export function appOrigin(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "").trim()
  if (typeof window !== "undefined") {
    // Prefer live origin so local/prod both work; env only if set and same host optional
    if (env && process.env.NODE_ENV === "production") return env
    return window.location.origin
  }
  return env || ""
}

/** Hash fragment keeps pot payload off server access logs. */
export function buildInviteUrl(pot: Pot): string {
  const encoded = encodePotShare(pot)
  const origin = appOrigin() || (typeof window !== "undefined" ? window.location.origin : "")
  return `${origin}/import#d=${encodeURIComponent(encoded)}`
}

export function readInvitePayloadFromLocation(): string | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash
  if (hash.startsWith("#d=")) {
    return decodeURIComponent(hash.slice(3))
  }
  const q = new URLSearchParams(window.location.search).get("d")
  return q
}
