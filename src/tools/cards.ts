import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { uid } from "../schemas.js";
import { StarlingClient } from "../client.js";
import { jsonResponse, errorResponse, logToolCall } from "../utils.js";

export function registerCardTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_list_cards",
    {
      title: "List Cards",
      description:
        "List all cards associated with the account. Returns card UIDs, type, status, and enabled controls.",
    },
    async () => {
      logToolCall("starling_list_cards");
      try {
        const result = await client.get("/api/v2/cards");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_enable_card",
    {
      title: "Enable/Disable Card",
      description: "Lock or unlock a card. Set enabled to false to lock the card.",
      inputSchema: {
        card_uid: uid.describe("The card UID"),
        enabled: z.boolean().describe("True to enable (unlock), false to disable (lock)"),
      },
    },
    async ({ card_uid, enabled }) => {
      logToolCall("starling_enable_card", { card_uid, enabled });
      try {
        const result = await client.putJson(
          `/api/v2/cards/${card_uid}/controls/enabled`,
          { enabled }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_enable_atm",
    {
      title: "Enable/Disable ATM Withdrawals",
      description: "Enable or disable ATM cash withdrawals for a card.",
      inputSchema: {
        card_uid: uid.describe("The card UID"),
        enabled: z.boolean().describe("True to enable ATM, false to disable"),
      },
    },
    async ({ card_uid, enabled }) => {
      logToolCall("starling_enable_atm", { card_uid, enabled });
      try {
        const result = await client.putJson(
          `/api/v2/cards/${card_uid}/controls/atm-enabled`,
          { enabled }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_enable_online_payments",
    {
      title: "Enable/Disable Online Payments",
      description: "Enable or disable online/e-commerce payments for a card.",
      inputSchema: {
        card_uid: uid.describe("The card UID"),
        enabled: z
          .boolean()
          .describe("True to enable online payments, false to disable"),
      },
    },
    async ({ card_uid, enabled }) => {
      logToolCall("starling_enable_online_payments", { card_uid, enabled });
      try {
        const result = await client.putJson(
          `/api/v2/cards/${card_uid}/controls/online-enabled`,
          { enabled }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_enable_mobile_wallet",
    {
      title: "Enable/Disable Mobile Wallet",
      description: "Enable or disable mobile wallet (Apple Pay, Google Pay) for a card.",
      inputSchema: {
        card_uid: uid.describe("The card UID"),
        enabled: z
          .boolean()
          .describe("True to enable mobile wallet, false to disable"),
      },
    },
    async ({ card_uid, enabled }) => {
      logToolCall("starling_enable_mobile_wallet", { card_uid, enabled });
      try {
        const result = await client.putJson(
          `/api/v2/cards/${card_uid}/controls/mobile-wallet-enabled`,
          { enabled }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_enable_gambling",
    {
      title: "Enable/Disable Gambling Payments",
      description: "Enable or disable gambling transactions for a card.",
      inputSchema: {
        card_uid: uid.describe("The card UID"),
        enabled: z
          .boolean()
          .describe("True to enable gambling payments, false to disable"),
      },
    },
    async ({ card_uid, enabled }) => {
      logToolCall("starling_enable_gambling", { card_uid, enabled });
      try {
        const result = await client.putJson(
          `/api/v2/cards/${card_uid}/controls/gambling-enabled`,
          { enabled }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_enable_pos",
    {
      title: "Enable/Disable POS Payments",
      description:
        "Enable or disable card-present / point-of-sale payments for a card.",
      inputSchema: {
        card_uid: uid.describe("The card UID"),
        enabled: z
          .boolean()
          .describe("True to enable POS payments, false to disable"),
      },
    },
    async ({ card_uid, enabled }) => {
      logToolCall("starling_enable_pos", { card_uid, enabled });
      try {
        const result = await client.putJson(
          `/api/v2/cards/${card_uid}/controls/pos-enabled`,
          { enabled }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_enable_mag_stripe",
    {
      title: "Enable/Disable Mag Stripe",
      description:
        "Enable or disable magnetic stripe payments for a card.",
      inputSchema: {
        card_uid: uid.describe("The card UID"),
        enabled: z
          .boolean()
          .describe("True to enable mag stripe, false to disable"),
      },
    },
    async ({ card_uid, enabled }) => {
      logToolCall("starling_enable_mag_stripe", { card_uid, enabled });
      try {
        const result = await client.putJson(
          `/api/v2/cards/${card_uid}/controls/mag-stripe-enabled`,
          { enabled }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
