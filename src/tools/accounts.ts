import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StarlingClient } from "../client.js";
import {
  jsonResponse,
  errorResponse,
  logToolCall,
  buildParams,
} from "../utils.js";

export function registerAccountTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_list_accounts",
    {
      title: "List Accounts",
      description:
        "List all accounts for the authenticated account holder. Returns account UIDs, currency, creation date, and default category UID.",
    },
    async () => {
      logToolCall("starling_list_accounts");
      try {
        const result = await client.get("/api/v2/accounts");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_account_identifiers",
    {
      title: "Get Account Identifiers",
      description:
        "Get account identifiers (sort code, account number, IBAN, BIC) for a specific account.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
      },
    },
    async ({ account_uid }) => {
      logToolCall("starling_get_account_identifiers", { account_uid });
      try {
        const result = await client.get(
          `/api/v2/accounts/${account_uid}/identifiers`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_balance",
    {
      title: "Get Account Balance",
      description:
        "Get the balance for a specific account. Returns cleared balance, effective balance, pending transactions, and accepted overdraft.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
      },
    },
    async ({ account_uid }) => {
      logToolCall("starling_get_balance", { account_uid });
      try {
        const result = await client.get(
          `/api/v2/accounts/${account_uid}/balance`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_confirmation_of_funds",
    {
      title: "Confirmation of Funds",
      description:
        "Check whether the account holds enough funds for a given amount. Returns true/false.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
        target_amount_in_minor_units: z
          .number()
          .int()
          .positive()
          .describe("Target amount in minor units (e.g., pence for GBP)"),
      },
    },
    async ({ account_uid, target_amount_in_minor_units }) => {
      logToolCall("starling_confirmation_of_funds", {
        account_uid,
        target_amount_in_minor_units,
      });
      try {
        const result = await client.get(
          `/api/v2/accounts/${account_uid}/confirmation-of-funds`,
          buildParams({
            targetAmountInMinorUnits: target_amount_in_minor_units,
          })
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_statement_periods",
    {
      title: "Get Available Statement Periods",
      description:
        "List the available statement periods for an account. Returns year-month periods that have statements.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
      },
    },
    async ({ account_uid }) => {
      logToolCall("starling_get_statement_periods", { account_uid });
      try {
        const result = await client.get(
          `/api/v2/accounts/${account_uid}/statement/available-periods`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
