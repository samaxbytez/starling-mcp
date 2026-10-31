# AGENTS.md

Project guidance for coding agents working in this repository.

## What this is

`starling-mcp`: an MCP server exposing the Starling Bank API as tools. TypeScript, ESM, stdio, published to npm as a single bundled file with no runtime dependencies. Layout and commands: [docs/development.md](docs/development.md).

## Threat model

Indirect prompt injection. Anything Starling returns (payee names, references, notes) may be written by a third party, so every tool argument is attacker-controlled.

- **IDs** in request paths use `uid` from `src/schemas.ts`, never `z.string()`.
- **`src/client.ts`** rejects absolute URLs, dot segments and encoded slashes, checks origin and the `/api/v2/` prefix, refuses redirects. Never weaken it.
- **Money-moving tools** (payments, payees, standing orders, savings-goal transfers and deletion, direct debit cancellation) belong in `SENSITIVE_TOOLS` in `src/policy.ts`. Every tool gets annotations from `annotationsFor`.
- **Sandbox and live tokens** use separate variables (`config.ts`). Never fall back from one to the other.
- Never log or echo the access token.
- `npm run attack` must stay green.

## Conventions

- Conventional Commits. `main` squash-merges, so the PR title becomes the commit and must be valid.
- Never push to `main`; branch and open a PR.
- Run `npm test`, `npm run lint`, `npm run type-check`, `npm run build`, `npm run smoke` and `npm run attack` before opening a PR.
- Keep tool counts in `README.md`, `docs/` and the tests in sync with the code.
- No runtime dependencies: SDK and zod stay in devDependencies.
