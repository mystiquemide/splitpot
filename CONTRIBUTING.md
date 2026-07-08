# Contributing to Splitpot

Thanks for taking the time to contribute. Splitpot is open source and welcomes improvements from anyone who wants self-custodial matchday pots to work better.

## Good first issues

Look for issues labeled `good first issue` on the tracker. Small docs fixes, UI polish, and wallet UX improvements are always appreciated.

## Local setup

```bash
git clone https://github.com/mystiquemide/splitpot.git
cd splitpot
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Branch and PR conventions

1. Branch from `main` with a short name (`fix/sign-modal-copy`, `feat/pot-export`).
2. Keep PRs focused. One concern per PR when you can.
3. Run checks before opening a PR:

```bash
npm run lint
npm run typecheck
npm run build
```

4. Fill out the pull request template.
5. Prefer clear commit messages that describe the change, not the process.

## Code of Conduct

Be respectful. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Harassment or bad-faith behavior is not welcome.

## Questions

Open an issue or start a discussion on the repo. If you are unsure whether a change fits, open a feature request first.
