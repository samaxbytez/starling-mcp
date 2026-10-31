#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StarlingClient } from "./client.js";
import { withToolPolicy } from "./policy.js";
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

const tools = withToolPolicy(server, {
  allowSensitive: process.env.STARLING_ENABLE_SENSITIVE_TOOLS === "true",
});

registerAccountTools(tools, client);
registerAccountHolderTools(tools, client);
registerFeedTools(tools, client);
registerSavingsGoalTools(tools, client);
registerPayeeTools(tools, client);
registerPaymentTools(tools, client);
registerStandingOrderTools(tools, client);
registerDirectDebitTools(tools, client);
registerCardTools(tools, client);
registerSpendingInsightTools(tools, client);

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
