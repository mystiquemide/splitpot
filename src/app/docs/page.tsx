import type { Metadata } from "next"
import Link from "next/link"
import {
  DocsH2,
  DocsLink,
  DocsNote,
  DocsP,
  DocsPage,
  DocsTable,
  DocsUl,
} from "@/components/docs/docs-page"

export const metadata: Metadata = {
  title: "Introduction",
}

export default function DocsIntroPage() {
  return (
    <DocsPage
      eyebrow="Documentation"
      title="Introduction"
      lead="Splitpot is a self-custodial matchday prediction pot. Friends stake the same amount, lock picks with wallet signatures, and split the pool when the match ends."
    >
      <section className="space-y-3">
        <DocsH2>What it is</DocsH2>
        <DocsP>
          Splitpot runs entirely in the browser. Each player creates or imports a wallet with{" "}
          <DocsLink href="https://wdk.tether.io">Tether WDK</DocsLink>. Picks are signed on the
          device. Optional on-chain mode sends USDt stakes to the host and pays winners with
          real ERC-20 transfers.
        </DocsP>
      </section>

      <section className="space-y-3">
        <DocsH2>Who it is for</DocsH2>
        <DocsUl>
          <li>Watch parties that already run cash or Venmo pots</li>
          <li>Groups that want signed picks without a custodial middleman</li>
          <li>Builders integrating Tether WDK into a clear consumer flow</li>
        </DocsUl>
      </section>

      <section className="space-y-3">
        <DocsH2>Product map</DocsH2>
        <DocsTable
          headers={["Surface", "Path", "Purpose"]}
          rows={[
            ["Landing", "/", "Product story and entry"],
            ["App", "/app", "Wallet, create pot, pot list"],
            ["Pot room", "/pot/[id]", "Join, lock, settle, pay"],
            ["Import", "/import", "Open a shared pot link"],
            ["Docs", "/docs", "This site"],
          ]}
        />
      </section>

      <section className="space-y-3">
        <DocsH2>Core ideas</DocsH2>
        <DocsUl>
          <li>
            <strong className="text-black font-medium">Equal stakes</strong> — every player commits
            the same amount
          </li>
          <li>
            <strong className="text-black font-medium">Signed picks</strong> — WDK signature binds
            pick to wallet address
          </li>
          <li>
            <strong className="text-black font-medium">Host settles</strong> — host records full-time
            result after picks lock
          </li>
          <li>
            <strong className="text-black font-medium">Optional USDt</strong> — on-chain deposits and
            payouts when configured
          </li>
        </DocsUl>
      </section>

      <DocsNote>
        Off-chain mode tracks commitments and signatures only. Money moves only when on-chain USDt
        is enabled and wallets are funded. Read{" "}
        <DocsLink href="/docs/security">Security</DocsLink> before using real funds.
      </DocsNote>

      <section className="space-y-3">
        <DocsH2>Next</DocsH2>
        <DocsP>
          <Link
            href="/docs/getting-started"
            className="text-black underline underline-offset-4"
          >
            Getting started
          </Link>{" "}
          walks through wallet creation and your first pot.
        </DocsP>
      </section>
    </DocsPage>
  )
}
