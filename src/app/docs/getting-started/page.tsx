import type { Metadata } from "next"
import {
  DocsCode,
  DocsH2,
  DocsLink,
  DocsNote,
  DocsOl,
  DocsP,
  DocsPage,
  DocsUl,
} from "@/components/docs/docs-page"

export const metadata: Metadata = {
  title: "Getting started",
}

export default function GettingStartedPage() {
  return (
    <DocsPage
      eyebrow="Start"
      title="Getting started"
      lead="Run Splitpot locally or open a deployed site, create a wallet, and open your first pot in a few minutes."
    >
      <section className="space-y-3">
        <DocsH2>Requirements</DocsH2>
        <DocsUl>
          <li>Node.js 20 or newer</li>
          <li>A modern browser (Chrome, Firefox, Safari, Edge)</li>
          <li>Optional: USDt and gas on your chosen network for on-chain mode</li>
        </DocsUl>
      </section>

      <section className="space-y-3">
        <DocsH2>Install and run</DocsH2>
        <DocsCode>{`git clone https://github.com/mystiquemide/splitpot.git
cd splitpot
npm install
cp .env.example .env.local
npm run dev`}</DocsCode>
        <DocsP>
          Open <DocsLink href="http://localhost:3000">http://localhost:3000</DocsLink>. Product
          app: <DocsLink href="http://localhost:3000/app">/app</DocsLink>.
        </DocsP>
      </section>

      <section className="space-y-3">
        <DocsH2>First pot (off-chain)</DocsH2>
        <DocsOl>
          <li>
            Go to <strong className="text-black font-medium">/app</strong>.
          </li>
          <li>
            Set a session passcode (min 8 chars), choose{" "}
            <strong className="text-black font-medium">Create WDK wallet</strong>, then sign the
            unlock message.
          </li>
          <li>
            Back up the seed offline (Show seed requires passcode). Vault is encrypted in this
            browser only.
          </li>
          <li>Fill match details, stake, and your pick. Leave on-chain off for a dry run.</li>
          <li>
            Sign and create. On the pot page, copy the{" "}
            <strong className="text-black font-medium">invite link</strong> (hash-based).
          </li>
          <li>Open the link on another device or profile, create a wallet there, and join.</li>
          <li>As host, lock picks when everyone is in, then settle the result.</li>
        </DocsOl>
      </section>

      <section className="space-y-3">
        <DocsH2>Optional: on-chain USDt</DocsH2>
        <DocsP>
          Set token and RPC on the same network in <code className="font-mono text-xs text-black">.env.local</code>:
        </DocsP>
        <DocsCode>{`NEXT_PUBLIC_EVM_RPC_URL=https://ethereum-rpc.publicnode.com
NEXT_PUBLIC_USDT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
NEXT_PUBLIC_USDT_DECIMALS=6
NEXT_PUBLIC_USDT_SYMBOL=USDt
NEXT_PUBLIC_CHAIN_NAME=Ethereum
NEXT_PUBLIC_EXPLORER_TX_URL=https://etherscan.io/tx/`}</DocsCode>
        <DocsP>
          Restart the dev server. Create a pot with <strong className="text-black font-medium">On-chain USDt stakes</strong> enabled. Joiners will be asked to send stake after signing.
        </DocsP>
      </section>

      <DocsNote>
        Default RPC (if env is empty) is Ethereum publicnode. Always pair RPC and USDt token on
        the same chain. See <DocsLink href="/docs/on-chain">On-chain USDt</DocsLink>.
      </DocsNote>

      <section className="space-y-3">
        <DocsH2>Useful commands</DocsH2>
        <DocsCode>{`npm run dev        # local development
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm start          # serve production build`}</DocsCode>
      </section>
    </DocsPage>
  )
}
