export type DocsNavItem = {
  href: string
  title: string
  description?: string
}

export type DocsNavSection = {
  title: string
  items: DocsNavItem[]
}

export const docsNav: DocsNavSection[] = [
  {
    title: "Start",
    items: [
      {
        href: "/docs",
        title: "Introduction",
        description: "What Splitpot is and who it is for",
      },
      {
        href: "/docs/getting-started",
        title: "Getting started",
        description: "Create a wallet and open your first pot",
      },
    ],
  },
  {
    title: "Product",
    items: [
      {
        href: "/docs/how-it-works",
        title: "How it works",
        description: "Pots, picks, lock, settle, and payouts",
      },
      {
        href: "/docs/wallets",
        title: "Wallets & signing",
        description: "WDK keys, signatures, and verification",
      },
      {
        href: "/docs/on-chain",
        title: "On-chain USDt",
        description: "Deposits, host escrow, and winner payments",
      },
    ],
  },
  {
    title: "Trust & ops",
    items: [
      {
        href: "/docs/security",
        title: "Security",
        description: "Threat model, storage, and safe use",
      },
      {
        href: "/docs/architecture",
        title: "Architecture",
        description: "System design and trust boundaries",
      },
      {
        href: "/docs/deployment",
        title: "Deployment",
        description: "Env vars, Vercel, and production checks",
      },
      {
        href: "/docs/faq",
        title: "FAQ",
        description: "Common questions and limits",
      },
    ],
  },
]

export function getAllDocsPages(): DocsNavItem[] {
  return docsNav.flatMap((s) => s.items)
}

export function getDocsNeighbors(href: string): {
  prev: DocsNavItem | null
  next: DocsNavItem | null
} {
  const pages = getAllDocsPages()
  const i = pages.findIndex((p) => p.href === href)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? pages[i - 1] : null,
    next: i < pages.length - 1 ? pages[i + 1] : null,
  }
}
