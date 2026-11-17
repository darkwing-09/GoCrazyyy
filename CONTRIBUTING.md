# Contributing to GoCrazy

Thanks for your interest in improving GoCrazy! Contributions of all kinds are
welcome — bug fixes, features, documentation, and ideas.

## Getting set up

See the [README](README.md#getting-started) for prerequisites and how to run
the app locally. In short:

```bash
# backend
cd backend && cp .env.example .env && uv run uvicorn app.main:app --reload --port 8000
# frontend
cd frontend && pnpm install && pnpm dev
```

## Workflow

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
2. Make your change, keeping it focused. One logical change per pull request.
3. **Run the checks** before pushing:
   ```bash
   cd backend && uv run pytest -q
   cd frontend && npx tsc -b && pnpm build
   ```
4. Commit with a clear message (see below), push your branch, and open a pull
   request against `main`. Fill in the PR template.

## Commit messages

Write a concise summary line in the imperative mood ("Add webhook retry",
"Fix contrast on meta text"), followed by a short body explaining the *why* if
it is not obvious.

## Coding conventions

**Backend (Python / FastAPI)**
- Money is always integer **paise** — never floats.
- A listing's rank is derived (`SUM(payments)`), never cached on the row.
- Payments enter the ledger through a single idempotent capture function.
- Verify Razorpay signatures on the **raw** request body.
- Keep secrets server-side; never expose them to the browser.

**Frontend (React / TypeScript)**
- Dark theme only; use the CSS variables in `src/index.css` (brand accent
  `#38bdf8`) rather than hard-coding colours.
- Icons come from `lucide-react`; motion from `motion`, respecting
  `prefers-reduced-motion`.
- `npx tsc -b` must pass with no errors.

## Reporting bugs and requesting features

Open an issue using the provided templates. For security issues, please do
**not** open a public issue — see [SECURITY.md](SECURITY.md).

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By
participating, you are expected to uphold it.
