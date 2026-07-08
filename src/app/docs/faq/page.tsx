import type { Metadata } from "next"
import {
  DocsH2,
  DocsLink,
  DocsP,
  DocsPage,
  DocsUl,
} from "@/components/docs/docs-page"

export const metadata: Metadata = {
  title: "FAQ",
}

const faqs: { q: string; a: string }[] = [
  {
    q: "Is Splitpot custodial?",
    a: "No. Each player controls their own WDK seed. In on-chain mode, stake is temporarily held by the host’s self-custodial wallet, not by a Splitpot server.",
  },
  {
    q: "Why can’t my friend see my pot?",
    a: "Pots live in browser storage. Send them the invite link so their browser can import the pot snapshot.",
  },
  {
    q: "Do I need USDt to try it?",
    a: "No. Leave on-chain stakes off. You can still create wallets, sign picks, lock, and settle.",
  },
  {
    q: "Who decides the match result?",
    a: "The host. Only settle with a host the group trusts.",
  },
  {
    q: "What networks are supported?",
    a: "Any EVM network your RPC and ERC-20 USDt (or test token) point to. Keep RPC and token on the same chain.",
  },
  {
    q: "Where is my seed stored?",
    a: "Encrypted in a session vault with your passcode. Plaintext only in memory while unlocked. Back it up offline if you care about the wallet.",
  },
  {
    q: "Can I delete a pot?",
    a: "Clearing site data removes pots. There is no server account. Treat invite links carefully.",
  },
  {
    q: "Is this audited?",
    a: "Treat it as open-source software under active development. Review Security docs before large stakes.",
  },
]

export default function FaqPage() {
  return (
    <DocsPage
      eyebrow="Trust & ops"
      title="FAQ"
      lead="Short answers to questions people hit first."
    >
      {faqs.map((item) => (
        <section key={item.q} className="space-y-2 border-b border-neutral-300 pb-6 last:border-0">
          <DocsH2>{item.q}</DocsH2>
          <DocsP>{item.a}</DocsP>
        </section>
      ))}

      <section className="space-y-3 pt-2">
        <DocsH2>Still stuck?</DocsH2>
        <DocsUl>
          <li>
            <DocsLink href="https://github.com/mystiquemide/splitpot/issues">
              GitHub issues
            </DocsLink>
          </li>
          <li>
            <DocsLink href="/docs/security">Security</DocsLink>
          </li>
          <li>
            <DocsLink href="/docs/getting-started">Getting started</DocsLink>
          </li>
        </DocsUl>
      </section>
    </DocsPage>
  )
}
