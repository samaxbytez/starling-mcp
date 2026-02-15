#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StarlingClient } from "./client.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerAccountHolderTools } from "./tools/account-holder.js";
import { registerFeedTools } from "./tools/feed.js";
import { registerSavingsGoalTools } from "./tools/savings-goals.js";
import { registerPayeeTools } from "./tools/payees.js";
import { registerPaymentTools } from "./tools/payments.js";
import { registerStandingOrderTools } from "./tools/standing-orders.js";
import { registerDirectDebitTools } from "./tools/direct-debits.js";
import { registerCardTools } from "./tools/cards.js";
import { registerSpendingInsightTools } from "./tools/spending-insights.js";

const STARLING_ACCESS_TOKEN = process.env.STARLING_ACCESS_TOKEN;

if (!STARLING_ACCESS_TOKEN) {
  console.error(
    "Missing required environment variable: STARLING_ACCESS_TOKEN"
  );
  process.exit(1);
}

const client = new StarlingClient(STARLING_ACCESS_TOKEN);

const server = new McpServer({
  name: "starling-mcp",
  version: "1.0.0",
});

registerAccountTools(server, client);
registerAccountHolderTools(server, client);
registerFeedTools(server, client);
registerSavingsGoalTools(server, client);
registerPayeeTools(server, client);
registerPaymentTools(server, client);
registerStandingOrderTools(server, client);
registerDirectDebitTools(server, client);
registerCardTools(server, client);
registerSpendingInsightTools(server, client);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Starling MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
