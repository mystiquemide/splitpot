# Deployment

## Prerequisites

- Node.js 20+
- npm 10+
- A GitHub repository with Actions enabled
- Optional: Vercel account for hosting

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_EVM_RPC_URL` | No | EVM JSON-RPC used by WDK. Must match the USDt token chain. |
| `NEXT_PUBLIC_APP_URL` | No | Canonical app URL for share links in production. |
| `NEXT_PUBLIC_USDT_ADDRESS` | For on-chain mode | ERC-20 USDt contract address |
| `NEXT_PUBLIC_USDT_DECIMALS` | No | Default `6` |
| `NEXT_PUBLIC_USDT_SYMBOL` | No | Default `USDt` |
| `NEXT_PUBLIC_CHAIN_NAME` | No | Display name (e.g. Ethereum) |
| `NEXT_PUBLIC_EXPLORER_TX_URL` | No | Prefix for tx links |

Copy `.env.example` to `.env.local` for local work. Never commit real secrets.

## Local production build

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm start
```

App listens on [http://localhost:3000](http://localhost:3000).

## Vercel

1. Import the GitHub repo in the Vercel dashboard, or:

```bash
npx vercel link
npx vercel
npx vercel --prod
```

2. Framework: Next.js (auto-detected).
3. Set optional env vars under Project Settings → Environment Variables.
4. Redeploy after env changes.

`vercel.json` is minimal. Prefer Vercel auto-detection for Next.js; do not force Prisma steps (this project does not use a database).

## Post-deploy verification

- [ ] `/` loads the landing page
- [ ] `/app` loads wallet creation
- [ ] Create wallet → sign unlock challenge succeeds
- [ ] Create pot → sign join message succeeds
- [ ] Share link import works on a second browser profile
- [ ] No console errors on the critical path
- [ ] CI is green on `main`

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Build fails on `sodium-native` | Browser crypto alias missing | Ensure `next.config.ts` aliases `sodium-native` → `sodium-javascript` |
| Wallet create hangs | RPC unreachable | Set `NEXT_PUBLIC_EVM_RPC_URL` to a working endpoint |
| Share import empty | Wrong origin or truncated URL | Confirm full `/import?d=…` link |
| Stale deploy | CDN cache | Hard refresh or redeploy |

## Architecture reference

See [ARCHITECTURE.md](./ARCHITECTURE.md).
