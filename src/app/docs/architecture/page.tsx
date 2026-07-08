import type { Metadata } from "next"
import {
  DocsCode,
  DocsH2,
  DocsLink,
  DocsP,
  DocsPage,
  DocsTable,
  DocsUl,
} from "@/components/docs/docs-page"

export const metadata: Metadata = {
  title: "Architecture",
}

export default function ArchitecturePage() {
  return (
    <DocsPage
      eyebrow="Trust & ops"
      title="Architecture"
      lead="Browser-first architecture: UI, local storage, and Tether WDK. No pot backend."
    >
      <section className="space-y-3">
        <DocsH2>System overview</DocsH2>
        <DocsCode>{`Browser
├── Landing (/)
├── App (/app)
├── Pot room (/pot/[id])
├── Import (/import)
├── Docs (/docs)
├── sessionStorage → wallet seed + address
├── localStorage → pot records
└── Tether WDK → EVM RPC (sign, balance, transfer)`}</DocsCode>
      </section>

      <section className="space-y-3">
        <DocsH2>Layers</DocsH2>
        <DocsTable
          headers={["Layer", "Responsibility"]}
          rows={[
            ["UI (Next.js App Router)", "Landing, app, pot room, docs"],
            ["WDK client", "Seed, address, sign, verify, ERC-20 transfer"],
            ["Chain config", "Token address, decimals, explorer, RPC"],
            ["Store", "Wallet session + pot persistence + share encode"],
          ]}
        />
      </section>

      <section className="space-y-3">
        <DocsH2>Trust boundaries</DocsH2>
        <DocsUl>
          <li>
            <strong className="text-black font-medium">Device</strong> — seed, signatures, pot JSON
          </li>
          <li>
            <strong className="text-black font-medium">Network</strong> — EVM RPC, optional USDt
            transfers, invite URLs
          </li>
          <li>
            <strong className="text-black font-medium">Host player</strong> — lock, settle, on-chain
            custody of stakes
          </li>
        </DocsUl>
        <DocsP>
          Detailed diagrams also live in the repo:{" "}
          <DocsLink href="https://github.com/mystiquemide/splitpot/blob/main/docs/ARCHITECTURE.md">
            docs/ARCHITECTURE.md
          </DocsLink>
          .
        </DocsP>
      </section>

      <section className="space-y-3">
        <DocsH2>Stack</DocsH2>
        <DocsUl>
          <li>Next.js 16 + React 19 + TypeScript</li>
          <li>Tailwind CSS 4</li>
          <li>@tetherto/wdk + @tetherto/wdk-wallet-evm</li>
          <li>Apache 2.0 license</li>
        </DocsUl>
      </section>
    </DocsPage>
  )
}
