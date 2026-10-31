# starling-mcp

[![npm version](https://img.shields.io/npm/v/starling-mcp.svg)](https://www.npmjs.com/package/starling-mcp)
[![CI](https://github.com/samaxbytez/starling-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/samaxbytez/starling-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An MCP (Model Context Protocol) server for the [Starling Bank API](https://developer.starlingbank.com/docs). It lets Claude and other AI assistants check balances, read transactions, manage savings goals and control cards.

**Security stance.** Text returned by Starling (payee names, references, notes) can be written by other people, so every tool argument is treated as attacker-controlled. Tools that move money are **off by default**, IDs are validated as UUIDs, and requests cannot leave `/api/v2/` or follow a redirect. Details in [docs/security.md](docs/security.md).

## How it fits together

```
Your AI app ── MCP over stdio ──▶ starling-mcp ── HTTPS + bearer token ──▶ api.starlingbank.com
 (Claude, Cursor, ...)            (runs on your computer)                   (your personal token's scopes
                                                                             decide what is allowed)
```

## Quick start

1. **Get a token.** Create a personal access token in the [Starling Developer Portal](https://developer.starlingbank.com/), with the scopes you need.
2. **Add it to your AI app.** For Claude Desktop:
   ```json
   {
     "mcpServers": {
       "starling": {
         "command": "npx",
         "args": ["-y", "starling-mcp"],
         "env": { "STARLING_ACCESS_TOKEN": "your_token_here" }
       }
     }
   }
   ```
3. **Ask.** Restart the app and try "What's my Starling balance?"

Needs Node.js 24 or newer. Step-by-step: [docs/setup.md](docs/setup.md). Codex CLI, Cursor, VS Code, Windsurf and Gemini CLI: [docs/configuration.md](docs/configuration.md).

## What it can do

| Area | Tools | Examples |
| --- | --- | --- |
| Accounts | 5 | List accounts, balance, identifiers, confirmation of funds, statement periods |
| Account holder | 6 | Individual, joint and business details, addresses |
| Transaction feed | 6 | List, filter by date, update notes and spending categories |
| Savings goals | 7 | List, create, transfer in and out, delete, recurring transfers |
| Payees | 4 | List, create, delete |
| Payments | 3 | Make a UK payment, view payment orders |
| Standing orders | 5 | List, create, cancel, upcoming payments |
| Direct debits | 3 | List, view, cancel mandates |
| Card controls | 8 | Lock, ATM, online, mobile wallet, gambling, POS, mag stripe |
| Spending insights | 3 | By counter-party, category and country |

50 tools; 43 by default. The seven that move money or change who can be paid need `STARLING_ENABLE_SENSITIVE_TOOLS=true`. Full list: [docs/tools.md](docs/tools.md).

## Settings

| Variable | Description |
| --- | --- |
| `STARLING_ACCESS_TOKEN` | Personal access token (live) |
| `STARLING_ENV` | `production` (default) or `sandbox` |
| `STARLING_SANDBOX_ACCESS_TOKEN` | Token used in sandbox mode only |
| `STARLING_ENABLE_SENSITIVE_TOOLS` | `true` to register the money-moving tools |

More in [docs/configuration.md](docs/configuration.md).

## Development

```bash
npm ci && npm run build && npm test && npm run smoke && npm run attack
```

See [docs/development.md](docs/development.md).

## Documentation

[Setup](docs/setup.md) · [Configuration](docs/configuration.md) · [Tools](docs/tools.md) · [Security](docs/security.md) · [Troubleshooting](docs/troubleshooting.md) · [Development](docs/development.md) · [Releasing](RELEASING.md) · [Agent guidance](AGENTS.md)

## Links

[Starling developer docs](https://developer.starlingbank.com/docs) · [npm](https://www.npmjs.com/package/starling-mcp) · [Issues](https://github.com/samaxbytez/starling-mcp/issues)

## License

MIT
