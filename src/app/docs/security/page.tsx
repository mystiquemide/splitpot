import type { Metadata } from "next"
import {
  DocsH2,
  DocsLink,
  DocsP,
  DocsPage,
  DocsTable,
  DocsUl,
  DocsWarn,
} from "@/components/docs/docs-page"

export const metadata: Metadata = {
  title: "Security",
}

export default function SecurityPage() {
  return (
    <DocsPage
      eyebrow="Trust & ops"
      title="Security"
      lead="Honest threat model for a browser self-custodial pot app. Read this before using real funds."
    >
      <DocsWarn>
        Splitpot is self-custodial software, not a bank and not audited smart-contract escrow.
        You can lose funds through host fraud, phishing, device compromise, or user error.
      </DocsWarn>

      <section className="space-y-3">
        <DocsH2>What we protect</DocsH2>
        <DocsUl>
          <li>No server holds your seed (there is no custodial backend)</li>
          <li>Seed encrypted in sessionStorage (AES-GCM + PBKDF2 passcode); plaintext only in memory while unlocked</li>
          <li>Signing requires an explicit confirm UI</li>
          <li>Join signatures are verified before save and re-checked on import when messages exist</li>
          <li>Invite payloads use URL hash fragments (not sent as query to the origin server)</li>
          <li>Security headers including CSP on all routes</li>
          <li>No API routes that accept or store secrets</li>
        </DocsUl>
      </section>

      <section className="space-y-3">
        <DocsH2>What we do not protect against</DocsH2>
        <DocsTable
          headers={["Risk", "Why it matters", "Mitigation in app"]}
          rows={[
            [
              "XSS / malicious extension",
              "Compromised page can still abuse an unlocked session",
              "Seed encrypted at rest with passcode; CSP headers",
            ],
            [
              "Shared devices",
              "Someone else uses your unlocked tab",
              "Sign out; show-seed requires passcode; auto-hide seed",
            ],
            [
              "Host escrow",
              "On-chain stakes go to the host wallet",
              "Clear UI warnings; not a smart-contract escrow",
            ],
            [
              "Invite link leakage",
              "Links carry pot details",
              "Hash fragment (#d=); import confirm; overwrite warn",
            ],
            [
              "Dishonest settle",
              "Host chooses the recorded result",
              "UI states host authority; social trust only",
            ],
            [
              "RPC privacy",
              "Public RPCs see addresses",
              "Disclosed in wallet UI and docs",
            ],
          ]}
        />
      </section>

      <section className="space-y-3">
        <DocsH2>Safe operating practices</DocsH2>
        <DocsUl>
          <li>Use a dedicated browser profile for funded wallets</li>
          <li>Back up seeds offline; never paste them into chat</li>
          <li>Only pot with hosts and groups you trust</li>
          <li>Prefer small stakes while evaluating the product</li>
          <li>Sign out after shared-computer sessions</li>
          <li>Treat invite links like private group messages</li>
        </DocsUl>
      </section>

      <section className="space-y-3">
        <DocsH2>Report a vulnerability</DocsH2>
        <DocsP>
          Do not open a public issue for security bugs. Email{" "}
          <DocsLink href="mailto:splashmediahub@gmail.com">splashmediahub@gmail.com</DocsLink>{" "}
          with steps to reproduce. Full policy:{" "}
          <DocsLink href="https://github.com/mystiquemide/splitpot/blob/main/SECURITY.md">
            SECURITY.md
          </DocsLink>
          .
        </DocsP>
      </section>
    </DocsPage>
  )
}
