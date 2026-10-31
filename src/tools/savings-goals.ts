import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { uid, currency } from "../schemas.js";
import { StarlingClient } from "../client.js";
import { jsonResponse, errorResponse, logToolCall } from "../utils.js";

export function registerSavingsGoalTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_list_savings_goals",
    {
      title: "List Savings Goals",
      description:
        "List all savings goals (spaces) for an account. Returns goal name, target amount, saved amount, and percentage saved.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
      },
    },
    async ({ account_uid }) => {
      logToolCall("starling_list_savings_goals", { account_uid });
      try {
        const result = await client.get(
          `/api/v2/account/${account_uid}/savings-goals`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_savings_goal",
    {
      title: "Get Savings Goal",
      description:
        "Get details of a specific savings goal including name, target, total saved, and saved percentage.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        savings_goal_uid: uid.describe("The savings goal UID"),
      },
    },
    async ({ account_uid, savings_goal_uid }) => {
      logToolCall("starling_get_savings_goal", {
        account_uid,
        savings_goal_uid,
      });
      try {
        const result = await client.get(
          `/api/v2/account/${account_uid}/savings-goals/${savings_goal_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_create_savings_goal",
    {
      title: "Create Savings Goal",
      description:
        "Create a new savings goal (space). Specify a name, currency, and optional target amount.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        name: z.string().describe("Name of the savings goal"),
        currency: currency.describe("Currency code (e.g., GBP)"),
        target_minor_units: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Target amount in minor units (e.g., pence). Optional."),
      },
    },
    async ({ account_uid, name, currency, target_minor_units }) => {
      logToolCall("starling_create_savings_goal", { account_uid, name });
      try {
        const body = {
          name,
          currency,
          target:
            target_minor_units === undefined
              ? undefined
              : { currency, minorUnits: target_minor_units },
        };
        const result = await client.putJson(
          `/api/v2/account/${account_uid}/savings-goals`,
          body
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_add_money_to_savings_goal",
    {
      title: "Add Money to Savings Goal",
      description:
        "Add money to a savings goal from the main account. Uses a client-generated transfer UID for idempotency.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        savings_goal_uid: uid.describe("The savings goal UID"),
        transfer_uid: uid.describe(
            "A unique UUID for this transfer (client-generated, for idempotency)"
          ),
        currency: currency.describe("Currency code (e.g., GBP)"),
        amount_minor_units: z
          .number()
          .int()
          .positive()
          .describe("Amount to add in minor units (e.g., pence)"),
      },
    },
    async ({
      account_uid,
      savings_goal_uid,
      transfer_uid,
      currency,
      amount_minor_units,
    }) => {
      logToolCall("starling_add_money_to_savings_goal", {
        account_uid,
        savings_goal_uid,
        transfer_uid,
        amount_minor_units,
      });
      try {
        const result = await client.putJson(
          `/api/v2/account/${account_uid}/savings-goals/${savings_goal_uid}/add-money/${transfer_uid}`,
          { amount: { currency, minorUnits: amount_minor_units } }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_withdraw_from_savings_goal",
    {
      title: "Withdraw Money from Savings Goal",
      description:
        "Withdraw money from a savings goal back to the main account.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        savings_goal_uid: uid.describe("The savings goal UID"),
        transfer_uid: uid.describe(
            "A unique UUID for this transfer (client-generated, for idempotency)"
          ),
        currency: currency.describe("Currency code (e.g., GBP)"),
        amount_minor_units: z
          .number()
          .int()
          .positive()
          .describe("Amount to withdraw in minor units (e.g., pence)"),
      },
    },
    async ({
      account_uid,
      savings_goal_uid,
      transfer_uid,
      currency,
      amount_minor_units,
    }) => {
      logToolCall("starling_withdraw_from_savings_goal", {
        account_uid,
        savings_goal_uid,
        transfer_uid,
        amount_minor_units,
      });
      try {
        const result = await client.putJson(
          `/api/v2/account/${account_uid}/savings-goals/${savings_goal_uid}/withdraw-money/${transfer_uid}`,
          { amount: { currency, minorUnits: amount_minor_units } }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_delete_savings_goal",
    {
      title: "Delete Savings Goal",
      description:
        "Delete a savings goal. Any money in the goal will be returned to the main account.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        savings_goal_uid: uid.describe("The savings goal UID"),
      },
    },
    async ({ account_uid, savings_goal_uid }) => {
      logToolCall("starling_delete_savings_goal", {
        account_uid,
        savings_goal_uid,
      });
      try {
        const result = await client.deleteReq(
          `/api/v2/account/${account_uid}/savings-goals/${savings_goal_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_savings_goal_recurring_transfer",
    {
      title: "Get Recurring Transfer",
      description:
        "Get the recurring transfer rule set up for a savings goal.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        savings_goal_uid: uid.describe("The savings goal UID"),
      },
    },
    async ({ account_uid, savings_goal_uid }) => {
      logToolCall("starling_get_savings_goal_recurring_transfer", {
        account_uid,
        savings_goal_uid,
      });
      try {
        const result = await client.get(
          `/api/v2/account/${account_uid}/savings-goals/${savings_goal_uid}/recurring-transfer`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
