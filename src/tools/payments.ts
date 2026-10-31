import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { uid, currency } from "../schemas.js";
import { StarlingClient } from "../client.js";
import { jsonResponse, errorResponse, logToolCall } from "../utils.js";

export function registerPaymentTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_make_local_payment",
    {
      title: "Make Local Payment",
      description:
        "Make a domestic (UK) payment from an account to a payee. Requires the payee UID and payee account UID.",
      inputSchema: {
        account_uid: uid.describe("The source account UID"),
        category_uid: uid.describe("The category UID for the payment"),
        payee_uid: uid.describe("The destination payee UID"),
        payee_account_uid: uid.describe("The destination payee account UID"),
        currency: currency.describe("Currency code (e.g., GBP)"),
        amount_minor_units: z
          .number()
          .int()
          .positive()
          .describe("Amount in minor units (e.g., pence)"),
        reference: z
          .string()
          .describe("Payment reference (max 18 characters for UK payments)"),
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
    }) => {
      logToolCall("starling_make_local_payment", {
        account_uid,
        payee_uid,
        amount_minor_units,
      });
      try {
        const result = await client.putJson(
          `/api/v2/payments/local/account/${account_uid}/category/${category_uid}`,
          {
            payeeUid: payee_uid,
            payeeAccountUid: payee_account_uid,
            amount: { currency, minorUnits: amount_minor_units },
            reference,
          }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_payment_order",
    {
      title: "Get Payment Order",
      description:
        "Get details of a payment order by its UID. Returns payment status, amount, and counterparty.",
      inputSchema: {
        payment_order_uid: uid.describe("The payment order UID"),
      },
    },
    async ({ payment_order_uid }) => {
      logToolCall("starling_get_payment_order", { payment_order_uid });
      try {
        const result = await client.get(
          `/api/v2/payments/local/payment-order/${payment_order_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_payment_order_payments",
    {
      title: "Get Payment Order Payments",
      description:
        "Get the individual payments associated with a payment order.",
      inputSchema: {
        payment_order_uid: uid.describe("The payment order UID"),
      },
    },
    async ({ payment_order_uid }) => {
      logToolCall("starling_get_payment_order_payments", {
        payment_order_uid,
      });
      try {
        const result = await client.get(
          `/api/v2/payments/local/payment-order/${payment_order_uid}/payments`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
