# Boilerplate: Web3/dApp

Pre-built hackathon starter for Web3 projects. Wallet connect, smart contract interaction, RPC configs.

## What's Inside

| Layer | Stack | Notes |
|-------|-------|-------|
| Framework | Next.js 15 + TypeScript | App Router |
| Styling | Tailwind CSS v4 | Dark theme default |
| Web3 | wagmi v2 + viem + RainbowKit v2 + WalletConnect | Multi-chain (mainnet, sepolia, base, baseSepolia) |
| Auth | NextAuth v5 (beta) | Optional, for web2+web3 hybrid apps |
| Database | Prisma + SQLite | Optional, for storing user data off-chain |
| UI | 5 components | Button, Card, Modal, Toast, Skeleton |
| Deploy | Vercel + Railway | Configs for both |

## What to Strip

```
□ Web3 not needed → delete:
   - src/lib/web3.ts
   - src/components/web3/
   - Remove wagmi, viem, @tanstack/react-query, @rainbow-me/rainbowkit from package.json

□ Auth not needed → delete:
   - src/lib/auth.ts
   - src/middleware.ts
   - src/app/api/auth/
   - Remove next-auth from package.json

□ Database not needed → delete:
   - prisma/
   - src/lib/db.ts
   - Remove prisma, @prisma/client from package.json
```

## What to Customize

```
□ Chains → edit src/lib/web3.ts to add/remove chains
□ WalletConnect → set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in .env
□ Brand → update title, colors, logo
□ Landing page → rebuild using sr71-method (The Landing Page) skill
□ Smart contracts → add your contract ABIs and interaction hooks in src/lib/
```

## Setup After Clone

```bash
npm install
cp .env.example .env
# Fill in required env vars (WALLET_CONNECT_PROJECT_ID required)
npx prisma generate  # skip if database stripped
npm run dev
```
