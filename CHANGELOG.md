# Changelog

## 2.0.0

### Breaking

- Node 24 or later is required (was 18).
- Seven money-moving tools are off by default: `starling_make_local_payment`, `starling_create_payee`, `starling_create_standing_order`, `starling_add_money_to_savings_goal`, `starling_withdraw_from_savings_goal`, `starling_delete_savings_goal` and `starling_cancel_direct_debit_mandate`. Set `STARLING_ENABLE_SENSITIVE_TOOLS=true` to enable them. 43 of 50 tools are registered by default.
- Tool arguments are validated more strictly: `*_uid` values must be UUIDs, and currency, year, month, dates and timestamps must match their formats.

### Security

- API client rejects dot segments, encoded slashes and dots, absolute and scheme-relative URLs, and any path outside `/api/v2/`. Redirects are refused so the bearer token can't be forwarded, and requests time out after 30 seconds.
- Every tool carries MCP annotations (read-only, destructive, open-world).
- `STARLING_ENV=sandbox` uses `api-sandbox.starlingbank.com` with `STARLING_SANDBOX_ACCESS_TOKEN` only; it never falls back to the live token.
- `npm run attack` replays 1,610 hostile calls against a fake API in CI.

### Changed

- Published as a single bundled file with no runtime dependencies and a third-party licence file.
- The server reports its real package version.
- Error messages keep all validation messages, report `Retry-After` on rate limits and never echo non-JSON bodies.
- Tool output is compact JSON.
- Documentation restructured into a front-page README and `docs/`.

## 1.0.0

Initial release: 50 tools covering the Starling Bank API.
