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
  DocsWarn,
} from "@/components/docs/docs-page"

export const metadata: Metadata = {
  title: "On-chain USDt",
}

export default function OnChainPage() {
  return (
    <DocsPage
      eyebrow="Product"
      title="On-chain USDt"
      lead="Optional mode that moves real USDt with Tether WDK: joiners deposit stake to the host, host pays winners after settle."
    >
      <DocsWarn>
        Host escrow model: after deposit, the host wallet holds stakes. Choose hosts you trust.
        This is not a smart-contract escrow. A malicious host can withhold funds.
      </DocsWarn>

      <section className="space-y-3">
        <DocsH2>Enable on-chain mode</DocsH2>
        <DocsOl>
          <li>Set env vars so RPC and USDt token are on the same network.</li>
          <li>Restart the app.</li>
          <li>
            When creating a pot, enable <strong className="text-black font-medium">On-chain USDt stakes</strong>.
          </li>
        </DocsOl>
        <DocsTable
          headers={["Variable", "Role"]}
          rows={[
            ["NEXT_PUBLIC_EVM_RPC_URL", "JSON-RPC for WDK"],
            ["NEXT_PUBLIC_USDT_ADDRESS", "ERC-20 contract"],
            ["NEXT_PUBLIC_USDT_DECIMALS", "Usually 6 for USDt"],
            ["NEXT_PUBLIC_USDT_SYMBOL", "Display symbol"],
            ["NEXT_PUBLIC_CHAIN_NAME", "UI label"],
            ["NEXT_PUBLIC_EXPLORER_TX_URL", "Tx link prefix"],
          ]}
        />
      </section>

      <section className="space-y-3">
        <DocsH2>Flow</DocsH2>
        <DocsOl>
          <li>Host creates pot (host is marked as holding the pool; no self-transfer).</li>
          <li>Joiner signs pick, then confirms an ERC-20 transfer of the stake to the host.</li>
          <li>Host locks only after all non-host players show stake sent.</li>
          <li>Host settles the result.</li>
          <li>Host pays each winner with WDK transfer; explorer links are stored on the pot.</li>
        </DocsOl>
      </section>

      <section className="space-y-3">
        <DocsH2>Technical path</DocsH2>
        <DocsP>
          Transfers call{" "}
          <code className="font-mono text-xs text-black">
            account.transfer(&#123; token, recipient, amount &#125;)
          </code>{" "}
          on the WDK EVM account. Amount is converted to token base units with the configured
          decimals. Balance is checked before send.
        </DocsP>
      </section>

      <section className="space-y-3">
        <DocsH2>What you need in the wallet</DocsH2>
        <DocsUl>
          <li>Enough USDt for stake or payouts</li>
          <li>Native gas token for ERC-20 transfer fees</li>
          <li>Network matching the configured RPC and token</li>
        </DocsUl>
      </section>

      <DocsNote>
        Off-chain pots still work without token config. They track signatures and “mark paid”
        only. See <DocsLink href="/docs/how-it-works">How it works</DocsLink>.
      </DocsNote>
    </DocsPage>
  )
}
