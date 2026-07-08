import type { Metadata } from "next"
import {
  DocsH2,
  DocsLink,
  DocsNote,
  DocsOl,
  DocsP,
  DocsPage,
  DocsTable,
  DocsUl,
} from "@/components/docs/docs-page"

export const metadata: Metadata = {
  title: "How it works",
}

export default function HowItWorksPage() {
  return (
    <DocsPage
      eyebrow="Product"
      title="How it works"
      lead="A pot is a shared matchday pool with equal stakes, signed picks, a host lock, a settled result, and a payout plan."
    >
      <section className="space-y-3">
        <DocsH2>Lifecycle</DocsH2>
        <DocsOl>
          <li>
            <strong className="text-black font-medium">Create</strong> — host opens a pot with match
            names, stake size, and their own pick (signed).
          </li>
          <li>
            <strong className="text-black font-medium">Invite</strong> — host copies a share link.
            Friends import it into their browser.
          </li>
          <li>
            <strong className="text-black font-medium">Join</strong> — each player signs a pick. In
            on-chain mode they also send USDt stake to the host.
          </li>
          <li>
            <strong className="text-black font-medium">Lock</strong> — host locks when at least two
            players have joined (and stakes are in, if on-chain).
          </li>
          <li>
            <strong className="text-black font-medium">Settle</strong> — host signs the official
            full-time result.
          </li>
          <li>
            <strong className="text-black font-medium">Pay</strong> — winners split the pool. On-chain:
            host sends USDt. Off-chain: host marks paid after peer settlement.
          </li>
        </DocsOl>
      </section>

      <section className="space-y-3">
        <DocsH2>Pot status</DocsH2>
        <DocsTable
          headers={["Status", "Meaning"]}
          rows={[
            ["open", "Players can join and change nothing after lock"],
            ["locked", "Picks frozen; host can settle"],
            ["settled", "Result fixed; payout plan shown"],
          ]}
        />
      </section>

      <section className="space-y-3">
        <DocsH2>Picks</DocsH2>
        <DocsP>Each player chooses one of:</DocsP>
        <DocsUl>
          <li>Home team</li>
          <li>Draw</li>
          <li>Away team</li>
        </DocsUl>
        <DocsP>
          Correct picks share the total pool evenly. If nobody is correct, the UI tells the host
          to return stakes.
        </DocsP>
      </section>

      <section className="space-y-3">
        <DocsH2>Where data lives</DocsH2>
        <DocsTable
          headers={["Data", "Storage", "Notes"]}
          rows={[
            ["Wallet seed", "sessionStorage", "This browser tab session only"],
            ["Pot records", "localStorage", "Persists on this browser"],
            ["Invite link", "URL query", "Base64 pot snapshot for import"],
          ]}
        />
        <DocsP>
          Another device only sees a pot after opening an invite link. There is no central pot
          server.
        </DocsP>
      </section>

      <DocsNote>
        Hosts control lock and settle. Choose hosts you trust. For fund custody details, see{" "}
        <DocsLink href="/docs/on-chain">On-chain USDt</DocsLink> and{" "}
        <DocsLink href="/docs/security">Security</DocsLink>.
      </DocsNote>
    </DocsPage>
  )
}
