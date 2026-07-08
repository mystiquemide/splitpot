# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-07-08

### Added

- On-chain USDt stakes and payouts via WDK `transfer` (ERC-20)
- Transfer confirm modal with balance check and explorer links
- Pot option for on-chain mode; deposit status on participants
- Env config for token address, decimals, chain name, explorer

## [0.1.0] - 2026-07-08

### Added

- Consumer landing page and product app (`/`, `/app`, `/pot/[id]`, `/import`)
- Self-custodial wallets via Tether WDK (`@tetherto/wdk`, `@tetherto/wdk-wallet-evm`)
- Explicit sign-confirm flow with personal_sign and signature verification
- Matchday pots: create, join, lock picks, settle, payout plan
- Shareable pot import links
- Apache 2.0 license
- CI, CodeQL, and Dependabot
- Contributing guide, security policy, and deployment docs
- Issue and pull request templates

### Notes

- Off-chain mode still available when USDt env is unset
