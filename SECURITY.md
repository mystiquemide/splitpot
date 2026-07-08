# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a vulnerability

Do not open a public issue for security problems.

Email **splashmediahub@gmail.com** with:

- A short description of the issue
- Steps to reproduce
- Impact assessment if known
- Any suggested fix

You should receive an acknowledgment within a few business days. Please give us time to investigate and ship a fix before public disclosure.

## Scope notes

Splitpot is a self-custodial client app:

- Seeds are encrypted at rest (AES-GCM + PBKDF2 passcode) in session storage; plaintext only in memory while unlocked
- Never paste seeds into issues, emails, or pull requests
- On-chain stakes use host-wallet escrow (not a smart contract)
- Invite links carry pot metadata; prefer private sharing
- Do not report social-engineering of third-party RPCs unless it is a Splitpot integration bug

## Safe practices for users

- Use a strong session passcode and back up your seed offline
- Sign out on shared machines
- Treat invite links as sensitive
- Only pot with hosts you trust when on-chain mode is on
