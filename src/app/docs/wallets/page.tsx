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
  title: "Wallets & signing",
}

export default function WalletsPage() {
  return (
    <DocsPage
      eyebrow="Product"
      title="Wallets & signing"
      lead="Splitpot uses Tether WDK for self-custodial EVM wallets. Keys never leave the browser. Sensitive actions require an explicit sign confirm."
    >
      <section className="space-y-3">
        <DocsH2>Create or import</DocsH2>
        <DocsUl>
          <li>
            <strong className="text-black font-medium">Create</strong> — generates a BIP-39 seed via{" "}
            <code className="font-mono text-xs text-black">WDK.getRandomSeedPhrase()</code>
          </li>
          <li>
            <strong className="text-black font-medium">Import</strong> — paste a 12 or 24 word seed
            you already control
          </li>
          <li>
            <strong className="text-black font-medium">Unlock</strong> — first-time sign of a
            challenge message proves key control
          </li>
        </DocsUl>
        <DocsP>
          Address derivation and signing use{" "}
          <code className="font-mono text-xs text-black">@tetherto/wdk-wallet-evm</code> with{" "}
          <code className="font-mono text-xs text-black">SeedSignerEvm</code>.
        </DocsP>
      </section>

      <section className="space-y-3">
        <DocsH2>What gets signed</DocsH2>
        <DocsTable
          headers={["Action", "Type", "Purpose"]}
          rows={[
            ["Unlock wallet", "Message sign", "Prove control of the seed"],
            ["Create / join pot", "Message sign", "Bind pick + stake to address"],
            ["Settle pot", "Message sign", "Host commits full-time result"],
            ["Deposit / payout", "On-chain ERC-20 transfer", "Move USDt (if enabled)"],
          ]}
        />
        <DocsP>
          Message signatures are verified with a WDK read-only account before the action is
          saved. There is no silent signing.
        </DocsP>
      </section>

      <section className="space-y-3">
        <DocsH2>Safe use checklist</DocsH2>
        <DocsOl>
          <li>Write the seed offline when you create a wallet.</li>
          <li>Never paste a seed into chat, email, or a random website.</li>
          <li>Use Sign out on shared computers.</li>
          <li>Treat invite links as sensitive (they contain pot details).</li>
          <li>Only fund wallets you intend to use for pots.</li>
        </DocsOl>
      </section>

      <DocsNote>
        Seeds are encrypted with your session passcode (AES-GCM) before sitting in{" "}
        <code className="font-mono text-xs">sessionStorage</code>. Plaintext seed only lives in
        memory while unlocked. That is better than plain storage, still not a hardware wallet.
        Read <DocsLink href="/docs/security">Security</DocsLink> for the full threat model.
      </DocsNote>

      <section className="space-y-3">
        <DocsH2>References</DocsH2>
        <DocsUl>
          <li>
            <DocsLink href="https://wdk.tether.io">WDK by Tether</DocsLink>
          </li>
          <li>
            <DocsLink href="https://docs.wdk.tether.io">WDK documentation</DocsLink>
          </li>
          <li>
            <DocsLink href="https://github.com/tetherto/wdk">@tetherto/wdk on GitHub</DocsLink>
          </li>
        </DocsUl>
      </section>
    </DocsPage>
  )
}
