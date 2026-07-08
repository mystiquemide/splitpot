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

## Product surfaces

| URL | What |
|-----|------|
| `/` | Consumer landing page |
| `/app` | Create wallet, open pots |
| `/pot/[id]` | Join, lock, settle |
| `/import?d=…` | Import shared pot |

## Real wallet signing

Every sensitive action opens a **SignRequest** modal:

1. User reads the full message (pot, pick, stake, address)
2. User clicks **Sign with WDK** (no silent signing)
3. `account.sign(message)` runs via `@tetherto/wdk-wallet-evm`
4. Signature is **verified** with `WalletAccountReadOnlyEvm.verify()`
5. Only then is the action saved

Actions gated: unlock wallet · create pot · join pot · settle pot.

## Demo path (judges, under 3 minutes)

1. Open `/` → **Open app**
2. **Create WDK wallet** → sign unlock challenge
3. **Create pot** → review message → sign
4. **Add demo friend** (second wallet, sign + verify)
5. **Lock picks** → **Review & sign to settle**
6. See **payout plan** and mark paid

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
