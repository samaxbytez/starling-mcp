#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StarlingClient } from "./client.js";
import { loadConfig, type Config } from "./config.js";
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

declare const PACKAGE_VERSION: string;

let config: Config;
try {
  config = loadConfig(process.env);
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

const client = new StarlingClient(config.accessToken, config.baseUrl);

const server = new McpServer({
  name: "starling-mcp",
  version: PACKAGE_VERSION,
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
  console.error(
    `Starling MCP Server running on stdio (${config.sandbox ? "sandbox" : "live"})`
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
