# Architecture

Splitpot is a browser-first, self-custodial matchday pot product. Wallet keys never leave the client. Pot coordination is local (browser storage + shareable encoded state). Signing uses Tether WDK on EVM.

## System overview

```mermaid
flowchart LR
  User[User / browser]
  Landing[Landing /]
  App[App /app]
  PotRoom[Pot room /pot/id]
  Store[localStorage + sessionStorage]
  WDK[Tether WDK EVM]
  RPC[EVM RPC provider]

  User --> Landing
  User --> App
  User --> PotRoom
  App --> Store
  PotRoom --> Store
  App --> WDK
  PotRoom --> WDK
  WDK --> RPC
```

## Trust boundaries

```mermaid
flowchart TB
  subgraph device [User device]
    Seed[Seed phrase in sessionStorage]
    Sign[WDK account.sign]
    Verify[Read-only verify]
    PotState[Pot records in localStorage]
  end

  subgraph network [Network]
    RPC[EVM RPC - address ops / optional chain]
    Share[Share links - pot JSON encoded]
  end

  Seed --> Sign
  Sign --> Verify
  Sign --> PotState
  PotState --> Share
  WDK[WDK modules] --> RPC
```

## Signing flow

```mermaid
sequenceDiagram
  participant U as User
  participant UI as SignRequest modal
  participant W as WDK wallet-evm
  participant V as Read-only verify
  participant S as Pot store

  U->>UI: Review message
  U->>UI: Confirm Sign with WDK
  UI->>W: account.sign(message)
  W-->>UI: signature
  UI->>V: verify(address, message, signature)
  V-->>UI: valid
  UI->>S: persist action
  S-->>U: updated pot / wallet state
```

## Layers

| Layer | Responsibility |
|-------|----------------|
| Landing | Product positioning and entry to the app |
| App shell | Wallet unlock, pot list, create pot |
| Pot room | Join, lock, settle, payout plan |
| WDK client | Seed, address, sign, verify, optional send |
| Store | Session wallet + durable pot list |

## Design decisions

1. **Self-custody first** — seeds stay in the browser; no custodial backend.
2. **Explicit signing** — no silent signatures; users read the message first.
3. **Equal-stake pots** — simple rules people already understand from cash pots.
4. **Peer settlement** — payout plan points at winner addresses; transfers remain user-controlled.
5. **Apache 2.0** — public open source for inspection and reuse.
