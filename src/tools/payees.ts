import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StarlingClient } from "../client.js";
import { jsonResponse, errorResponse, logToolCall } from "../utils.js";

export function registerPayeeTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_list_payees",
    {
      title: "List Payees",
      description:
        "List all saved payees. Returns payee names, accounts (sort code, account number), and UIDs.",
    },
    async () => {
      logToolCall("starling_list_payees");
      try {
        const result = await client.get("/api/v2/payees");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_create_payee",
    {
      title: "Create Payee",
      description:
        "Create a new payee with a bank account. Provide the payee name, account name, sort code, and account number.",
      inputSchema: {
        payee_name: z.string().describe("Name of the payee"),
        account_name: z
          .string()
          .describe("Name for the payee's bank account"),
        sort_code: z.string().length(6).describe("6-digit sort code"),
        account_number: z
          .string()
          .length(8)
          .describe("8-digit account number"),
      },
    },
    async ({ payee_name, account_name, sort_code, account_number }) => {
      logToolCall("starling_create_payee", { payee_name, account_name });
      try {
        const result = await client.putJson("/api/v2/payees", {
          payeeName: payee_name,
          phoneNumber: undefined,
          payeeType: "INDIVIDUAL",
          firstName: payee_name,
          accounts: [
            {
              description: account_name,
              defaultAccount: true,
              countryCode: "GB",
              accountIdentifier: sort_code + account_number,
              bankIdentifier: sort_code,
              bankIdentifierType: "SORT_CODE",
              accountIdentifierType: "SORT_CODE_ACCOUNT_NUMBER",
            },
          ],
        });
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_delete_payee",
    {
      title: "Delete Payee",
      description: "Delete a saved payee by their UID.",
      inputSchema: {
        payee_uid: z.string().describe("The payee UID to delete"),
      },
    },
    async ({ payee_uid }) => {
      logToolCall("starling_delete_payee", { payee_uid });
      try {
        const result = await client.deleteReq(
          `/api/v2/payees/${payee_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_delete_payee_account",
    {
      title: "Delete Payee Account",
      description:
        "Delete a specific bank account from a payee (if they have multiple accounts).",
      inputSchema: {
        payee_uid: z.string().describe("The payee UID"),
        account_uid: z
          .string()
          .describe("The payee account UID to delete"),
      },
    },
    async ({ payee_uid, account_uid }) => {
      logToolCall("starling_delete_payee_account", {
        payee_uid,
        account_uid,
      });
      try {
        const result = await client.deleteReq(
          `/api/v2/payees/${payee_uid}/account/${account_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
