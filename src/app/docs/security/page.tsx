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
          <li>Signing requires an explicit confirm UI</li>
          <li>Join signatures are verified before save</li>
          <li>No API routes that accept or store secrets</li>
        </DocsUl>
      </section>

      <section className="space-y-3">
        <DocsH2>What we do not protect against</DocsH2>
        <DocsTable
          headers={["Risk", "Why it matters"]}
          rows={[
            [
              "XSS / malicious extension",
              "Seed in sessionStorage can be read if the page is compromised",
            ],
            [
              "Shared devices",
              "Anyone with browser access can show seed or send funds",
            ],
            [
              "Host escrow",
              "On-chain stakes go to the host wallet; host can abscond",
            ],
            [
              "Invite link leakage",
              "URLs can include pot details (addresses, signatures, txs)",
            ],
            [
              "Dishonest settle",
              "Host chooses the recorded result",
            ],
            [
              "RPC privacy",
              "Public RPCs see your addresses and request timing",
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
