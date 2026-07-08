import type { Metadata } from "next"
import {
  DocsCode,
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
  title: "Deployment",
}

export default function DeploymentPage() {
  return (
    <DocsPage
      eyebrow="Trust & ops"
      title="Deployment"
      lead="Ship Splitpot as a static-friendly Next.js app. Configure public env vars carefully."
    >
      <section className="space-y-3">
        <DocsH2>Production build</DocsH2>
        <DocsCode>{`npm ci
npm run lint
npm run typecheck
npm run build
npm start`}</DocsCode>
      </section>

      <section className="space-y-3">
        <DocsH2>Environment variables</DocsH2>
        <DocsTable
          headers={["Variable", "Required", "Notes"]}
          rows={[
            ["NEXT_PUBLIC_EVM_RPC_URL", "Recommended", "Must match USDt chain"],
            ["NEXT_PUBLIC_USDT_ADDRESS", "For on-chain", "ERC-20 contract"],
            ["NEXT_PUBLIC_USDT_DECIMALS", "No", "Default 6"],
            ["NEXT_PUBLIC_USDT_SYMBOL", "No", "Default USDt"],
            ["NEXT_PUBLIC_CHAIN_NAME", "No", "UI label"],
            ["NEXT_PUBLIC_EXPLORER_TX_URL", "No", "Tx link prefix"],
            ["NEXT_PUBLIC_APP_URL", "No", "Documented; shares use window origin"],
          ]}
        />
        <DocsNote>
          All <code className="font-mono text-xs">NEXT_PUBLIC_*</code> values are exposed to the
          browser. Never put private keys or server secrets in these variables.
        </DocsNote>
      </section>

      <section className="space-y-3">
        <DocsH2>Vercel</DocsH2>
        <DocsOl>
          <li>Import the GitHub repository.</li>
          <li>Framework: Next.js (auto-detected).</li>
          <li>Set public env vars in Project Settings.</li>
          <li>Deploy production and hard-refresh once.</li>
        </DocsOl>
        <DocsCode>{`npx vercel link
npx vercel --prod`}</DocsCode>
      </section>

      <section className="space-y-3">
        <DocsH2>Post-deploy checks</DocsH2>
        <DocsUl>
          <li>/ loads landing</li>
          <li>/docs loads documentation</li>
          <li>/app can create a wallet and sign unlock</li>
          <li>Create pot and open share import on a second browser profile</li>
          <li>If on-chain: deposit and explorer link appear after transfer</li>
          <li>CI green on main</li>
        </DocsUl>
      </section>

      <section className="space-y-3">
        <DocsH2>More detail</DocsH2>
        <DocsP>
          Repo guide:{" "}
          <DocsLink href="https://github.com/mystiquemide/splitpot/blob/main/docs/DEPLOYMENT.md">
            docs/DEPLOYMENT.md
          </DocsLink>
        </DocsP>
      </section>
    </DocsPage>
  )
}
