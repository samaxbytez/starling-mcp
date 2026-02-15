import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StarlingClient } from "../client.js";
import {
  jsonResponse,
  errorResponse,
  logToolCall,
  buildParams,
} from "../utils.js";

export function registerStandingOrderTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_list_standing_orders",
    {
      title: "List Standing Orders",
      description:
        "List all standing orders for an account and category. Returns payment details, frequency, and next payment dates.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
        category_uid: z.string().describe("The category UID"),
      },
    },
    async ({ account_uid, category_uid }) => {
      logToolCall("starling_list_standing_orders", {
        account_uid,
        category_uid,
      });
      try {
        const result = await client.get(
          `/api/v2/payments/local/account/${account_uid}/category/${category_uid}/standing-orders`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_standing_order",
    {
      title: "Get Standing Order",
      description: "Get details of a specific standing order.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
        category_uid: z.string().describe("The category UID"),
        payment_order_uid: z.string().describe("The standing order payment order UID"),
      },
    },
    async ({ account_uid, category_uid, payment_order_uid }) => {
      logToolCall("starling_get_standing_order", {
        account_uid,
        category_uid,
        payment_order_uid,
      });
      try {
        const result = await client.get(
          `/api/v2/payments/local/account/${account_uid}/category/${category_uid}/standing-orders/${payment_order_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_create_standing_order",
    {
      title: "Create Standing Order",
      description:
        "Create a new standing order. Specify the payee, amount, reference, frequency, and start date.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
        category_uid: z.string().describe("The category UID"),
        payee_uid: z.string().describe("The destination payee UID"),
        payee_account_uid: z
          .string()
          .describe("The destination payee account UID"),
        currency: z.string().describe("Currency code (e.g., GBP)"),
        amount_minor_units: z
          .number()
          .int()
          .positive()
          .describe("Amount in minor units (e.g., pence)"),
        reference: z.string().describe("Payment reference"),
        frequency: z
          .enum(["DAILY", "WEEKLY", "EVERY_TWO_WEEKS", "MONTHLY", "EVERY_FOUR_WEEKS", "QUARTERLY", "YEARLY"])
          .describe("Payment frequency"),
        start_date: z
          .string()
          .describe("Start date in YYYY-MM-DD format"),
      },
    },
    async ({
      account_uid,
      category_uid,
      payee_uid,
      payee_account_uid,
      currency,
      amount_minor_units,
      reference,
      frequency,
      start_date,
    }) => {
      logToolCall("starling_create_standing_order", {
        account_uid,
        payee_uid,
        amount_minor_units,
        frequency,
      });
      try {
        const result = await client.putJson(
          `/api/v2/payments/local/account/${account_uid}/category/${category_uid}/standing-orders`,
          {
            payeeUid: payee_uid,
            payeeAccountUid: payee_account_uid,
            amount: { currency, minorUnits: amount_minor_units },
            reference,
            standingOrderRecurrence: {
              startDate: start_date,
              frequency,
            },
          }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_cancel_standing_order",
    {
      title: "Cancel Standing Order",
      description: "Cancel an existing standing order.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
        category_uid: z.string().describe("The category UID"),
        payment_order_uid: z.string().describe("The standing order payment order UID"),
      },
    },
    async ({ account_uid, category_uid, payment_order_uid }) => {
      logToolCall("starling_cancel_standing_order", {
        account_uid,
        category_uid,
        payment_order_uid,
      });
      try {
        const result = await client.deleteReq(
          `/api/v2/payments/local/account/${account_uid}/category/${category_uid}/standing-orders/${payment_order_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_upcoming_standing_order_payments",
    {
      title: "Get Upcoming Standing Order Payments",
      description:
        "Get the next upcoming payment dates for a standing order.",
      inputSchema: {
        account_uid: z.string().describe("The account UID"),
        category_uid: z.string().describe("The category UID"),
        payment_order_uid: z.string().describe("The standing order payment order UID"),
        count: z
          .number()
          .int()
          .positive()
          .max(100)
          .optional()
          .describe("Number of upcoming payments to return (default varies)"),
      },
    },
    async ({ account_uid, category_uid, payment_order_uid, count }) => {
      logToolCall("starling_get_upcoming_standing_order_payments", {
        account_uid,
        category_uid,
        payment_order_uid,
        count,
      });
      try {
        const params = count ? buildParams({ count }) : undefined;
        const result = await client.get(
          `/api/v2/payments/local/account/${account_uid}/category/${category_uid}/standing-orders/${payment_order_uid}/upcoming-payments`,
          params
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
