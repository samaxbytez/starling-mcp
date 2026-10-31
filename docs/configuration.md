# Configuration

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `STARLING_ACCESS_TOKEN` | Yes (live) | Personal access token for your real account |
| `STARLING_ENV` | No | `production` (default) or `sandbox` |
| `STARLING_SANDBOX_ACCESS_TOKEN` | Yes (sandbox) | Token for a sandbox customer. Used only when `STARLING_ENV=sandbox` |
| `STARLING_ENABLE_SENSITIVE_TOOLS` | No | `true` registers the 7 tools that move money or change who can be paid. Off by default |
| `STARLING_API_BASE_URL` | No | Override the API origin, for testing against a fake server. https, or http on loopback only |

## Sandbox and live are kept apart

In sandbox mode the server talks to `api-sandbox.starlingbank.com` and reads only `STARLING_SANDBOX_ACCESS_TOKEN`. It never falls back to `STARLING_ACCESS_TOKEN`, so a live token cannot be sent to the sandbox, and a sandbox token cannot reach the live API.

## AI apps

All of these run the same command: `npx -y starling-mcp` with the token in its environment.

### Claude Desktop and Claude Code

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

Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`. Claude Code: `.mcp.json` in your project, or `claude mcp add starling -e STARLING_ACCESS_TOKEN=... -- npx -y starling-mcp`.

### Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.starling]
command = "npx"
args = ["-y", "starling-mcp"]
env = { STARLING_ACCESS_TOKEN = "your_token_here" }
```

### Cursor

Add the same `mcpServers` block to `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (one project).

### Windsurf

Add the same `mcpServers` block to `~/.codeium/windsurf/mcp_config.json`.

### Gemini CLI

Add the same `mcpServers` block to `~/.gemini/settings.json`, alongside any settings already there.

### VS Code (GitHub Copilot agent mode)

Add to `.vscode/mcp.json`. VS Code uses `servers` rather than `mcpServers`, and can prompt for the token so it never sits in a file:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "starling-token",
      "description": "Starling personal access token",
      "password": true
    }
  ],
  "servers": {
    "starling": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "starling-mcp"],
      "env": { "STARLING_ACCESS_TOKEN": "${input:starling-token}" }
    }
  }
}
```

### ChatGPT and Grok

Not supported. This server runs on your computer and talks to its client over stdio. ChatGPT's connectors and xAI's Grok only connect to MCP servers hosted on the internet over HTTPS.

### Any other MCP client

```bash
STARLING_ACCESS_TOKEN=your_token npx starling-mcp
```
