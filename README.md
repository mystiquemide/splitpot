# Splitpot

Matchday prediction pots for friends. Equal stake, lock picks, settle full time, split the pool.  
Self-custodial wallets via **Tether WDK**. No custodian. No cloud AI.

**Track:** WDK  
**Theme:** football / global tournament (watch parties, predictions, tipping-style stakes)  
**License:** Apache 2.0  
**Hackathon:** [Tether Developers Cup](https://dorahacks.io/hackathon/tether-developers-cup/detail)

## Why it exists

Watch parties already run informal pots on Venmo, cash, or “trust me bro.” Splitpot makes that flow honest:

1. Each player creates a **self-custodial WDK wallet**
2. Everyone stakes the same amount and locks a pick
3. Host settles the official result
4. Winners split the pool; pay peer-to-peer USDt to winner addresses

## How we use WDK (meaningful, not a logo)

| Action | WDK API |
|--------|---------|
| Create wallet | `WDK.getRandomSeedPhrase()` + `registerWallet('ethereum', WalletManagerEvm)` |
| Derive address | `wdk.getAccount('ethereum', 0)` → `getAddress()` |
| Join pot | `account.sign(message)` attestation of pot id + pick + stake |
| Optional chain | Sepolia RPC for balance / native send when funded |

Keys never leave the browser session (`sessionStorage`). No server custody.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional env:

```bash
# .env.local
NEXT_PUBLIC_EVM_RPC_URL=https://sepolia.drpc.org
```

## Demo path (judges, under 3 minutes)

1. **Create WDK wallet** on the home page  
2. **Create pot** (pick a sample match, stake, your pick)  
3. **Add demo friend** (generates a second WDK wallet, joins with opposite pick)  
4. **Lock picks** → **Settle** with a result  
5. See **payout plan** and mark paid  

Share link copies pot state so another browser can import it.

## Stack

- Next.js (App Router) + TypeScript + Tailwind  
- `@tetherto/wdk` + `@tetherto/wdk-wallet-evm`  
- Client-side pot store (`localStorage`) + share import  

## Third-party services

| Service | Use | Required? |
|---------|-----|-----------|
| Public Sepolia RPC (`sepolia.drpc.org` or your URL) | Address derivation network config / optional balance | For WDK EVM provider |
| None for pot coordination | Pots live in browser / share links | — |

No cloud AI. No custodial backend.

## Prior work

Boilerplate skeleton from `MystiqueMide/boilerplate-web3` (stripped). All Splitpot product logic and WDK integration written during the hackathon period.

## Nation

Configure on DoraHacks submission (team represents a nation of choice).

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
