# Development

```bash
npm ci
npm run build      # esbuild bundle to build/index.js
npm test           # vitest
npm run lint
npm run type-check
npm run smoke      # starts build/index.js over MCP stdio, checks version, tools, annotations, gating
npm run attack     # hostile-argument test against a fake API (needs a build)
```

Requires Node 24 or newer.

## Layout

```
src/
├── index.ts      # entry point: config, client, policy wrapper, tool registration
├── config.ts     # env parsing; sandbox vs live token and base URL
├── client.ts     # StarlingClient: confined fetch wrapper
├── policy.ts     # annotations for every tool; gated tools
├── schemas.ts    # uid, currency, year, month, date schemas
├── utils.ts      # jsonResponse, errorResponse, logToolCall, buildParams, definedOnly
└── tools/        # one file per resource, each exporting registerXxxTools(server, client)
scripts/
├── bundle.mjs    # esbuild; inlines the version; writes third-party licences
├── smoke.mjs
└── attack.mjs
```

The SDK and zod are devDependencies because they are bundled. Do not add runtime `dependencies`; the smoke test fails if there are any.

## Adding a tool

1. Add it to the matching file in `src/tools/` with `server.registerTool(...)`.
2. Any ID in a request path uses `uid` from `schemas.ts`, never `z.string()`. Currency, dates and months have schemas there too.
3. Call `logToolCall`, then return `jsonResponse` or `errorResponse`.
4. If it moves money, adds a payee or sends data out, add it to `SENSITIVE_TOOLS` in `policy.ts` and to the list in `scripts/smoke.mjs`.
5. Update the tool counts in `README.md`, `docs/tools.md` and the tests.

`src/tools/path-injection.test.ts` registers every tool and checks that each `*_uid` argument rejects traversal payloads.
