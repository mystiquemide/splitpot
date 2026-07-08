import type { Metadata } from "next"
import { DocsShell } from "@/components/docs/docs-shell"

export const metadata: Metadata = {
  title: {
    template: "%s · Splitpot Docs",
    default: "Documentation · Splitpot",
  },
  description:
    "Official Splitpot documentation: wallets, pots, on-chain USDt, security, architecture, and deployment.",
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>
}
