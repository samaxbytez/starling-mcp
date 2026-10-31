import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { uid, year, month } from "../schemas.js";
import { StarlingClient } from "../client.js";
import {
  jsonResponse,
  errorResponse,
  logToolCall,
  buildParams,
} from "../utils.js";

export function registerSpendingInsightTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_spending_by_counterparty",
    {
      title: "Spending Insights by Counter-Party",
      description:
        "Get spending insights grouped by counter-party for a given month. Shows how much was spent with each merchant/payee.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        year: year.describe("Year (e.g., 2024)"),
        month: month.describe("Month as two-digit string (e.g., 01 for January)"),
      },
    },
    async ({ account_uid, year, month }) => {
      logToolCall("starling_spending_by_counterparty", {
        account_uid,
        year,
        month,
      });
      try {
        const result = await client.get(
          `/api/v2/accounts/${account_uid}/spending-insights/counter-party`,
          buildParams({ year, month })
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_spending_by_category",
    {
      title: "Spending Insights by Category",
      description:
        "Get spending insights grouped by spending category for a given month. Shows how much was spent in each category (groceries, transport, etc.).",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        year: year.describe("Year (e.g., 2024)"),
        month: month.describe("Month as two-digit string (e.g., 01 for January)"),
      },
    },
    async ({ account_uid, year, month }) => {
      logToolCall("starling_spending_by_category", {
        account_uid,
        year,
        month,
      });
      try {
        const result = await client.get(
          `/api/v2/accounts/${account_uid}/spending-insights/spending-category`,
          buildParams({ year, month })
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_spending_by_country",
    {
      title: "Spending Insights by Country",
      description:
        "Get spending insights grouped by country for a given month. Useful for seeing international spending.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        year: year.describe("Year (e.g., 2024)"),
        month: month.describe("Month as two-digit string (e.g., 01 for January)"),
      },
    },
    async ({ account_uid, year, month }) => {
      logToolCall("starling_spending_by_country", {
        account_uid,
        year,
        month,
      });
      try {
        const result = await client.get(
          `/api/v2/accounts/${account_uid}/spending-insights/country`,
          buildParams({ year, month })
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
