# Setup

Three steps, about five minutes. You need Node.js 24 or newer.

## 1. Create a Starling personal access token

1. Open the [Starling Developer Portal](https://developer.starlingbank.com/) and sign in with your Starling account.
2. Create a personal access token. Tick only the scopes you need, for example `account:read`, `balance:read`, `transaction:read` and `savings-goal:read` for read-only use. Leave out anything that creates payments, payees, standing orders or savings-goal transfers unless you will enable the sensitive tools. Scope names are listed in the portal.
3. Copy the token. Starling shows it once.

The scopes are your real safety net. A token without a payment scope cannot make payments whatever the server or the model does. Personal tokens are limited to 5 requests per second and 1,000 per day.

To try things without touching real money, create a sandbox customer in the developer portal and use its token with `STARLING_ENV=sandbox` (see [configuration.md](configuration.md)).

## 2. Add the server to your AI app

For Claude Desktop, edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Other apps: see [configuration.md](configuration.md).

## 3. Check it works

Restart the app and ask "What's my Starling balance?". If you see an error instead, see [troubleshooting.md](troubleshooting.md).

By default, tools that move money are off. To turn them on, read [security.md](security.md) first.
