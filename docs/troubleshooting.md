# Troubleshooting

**"Missing required environment variable: STARLING_ACCESS_TOKEN"**: the token is not in the server's environment. Check the `env` block in your client config. In sandbox mode the variable is `STARLING_SANDBOX_ACCESS_TOKEN`.

**"Starling API error (401): invalid_token"**: the token expired or was revoked. Generate a new one in the [developer portal](https://developer.starlingbank.com/).

**"Starling API error (403)"**: the token lacks the scope for that call. Create a token with the scope in the developer portal.

**"Starling API error (429): rate_limited"**: personal tokens allow 5 requests per second and 1,000 per day. The message includes Starling's `Retry-After` when it sends one.

**A payment, payee or standing-order tool is missing**: they are off by default. See [security.md](security.md).

**"Must be a UUID"**: an `*_uid` argument was not a UUID. Take the value from the matching list tool, for example `starling_list_accounts` for `account_uid` and its `defaultCategory` for `category_uid`.

**"Unsafe API path rejected"**: an argument tried to alter the request path. This is the confinement check working; use a real UID.

**Requires Node 24**: `npx` fails on older Node. Upgrade Node, or build from source on a supported version.

**Feed results look too long**: Starling returns the whole window. Use `starling_list_feed_items_between` with a narrower range.
