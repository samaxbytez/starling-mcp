import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { uid, isoTimestamp } from "../schemas.js";
import { StarlingClient } from "../client.js";
import {
  jsonResponse,
  errorResponse,
  logToolCall,
  buildParams,
} from "../utils.js";

export function registerFeedTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_list_feed_items",
    {
      title: "List Feed Items",
      description:
        "Get transaction feed items for an account and category. Optionally filter by changes since a given timestamp. Returns transactions with amounts, directions, status, counterparty info.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        category_uid: uid.describe(
            "The category UID (use the defaultCategory from list accounts)"
          ),
        changes_since: isoTimestamp
          .optional()
          .describe(
            "ISO 8601 timestamp to filter items changed after this time (e.g., 2024-01-01T00:00:00.000Z)"
          ),
      },
    },
    async ({ account_uid, category_uid, changes_since }) => {
      logToolCall("starling_list_feed_items", {
        account_uid,
        category_uid,
        changes_since,
      });
      try {
        const params = changes_since
          ? buildParams({ changesSince: changes_since })
          : undefined;
        const result = await client.get(
          `/api/v2/feed/account/${account_uid}/category/${category_uid}`,
          params
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_feed_item",
    {
      title: "Get Feed Item",
      description:
        "Get a single transaction feed item by its UID. Returns full details including amount, direction, status, counterparty, category, and notes.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        category_uid: uid.describe("The category UID"),
        feed_item_uid: uid.describe("The feed item UID"),
      },
    },
    async ({ account_uid, category_uid, feed_item_uid }) => {
      logToolCall("starling_get_feed_item", {
        account_uid,
        category_uid,
        feed_item_uid,
      });
      try {
        const result = await client.get(
          `/api/v2/feed/account/${account_uid}/category/${category_uid}/${feed_item_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_list_feed_items_between",
    {
      title: "List Feed Items Between Dates",
      description:
        "Get transaction feed items between two timestamps. Useful for querying transactions in a specific date range.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        category_uid: uid.describe("The category UID"),
        min_transaction_timestamp: isoTimestamp
          .describe(
            "Start of range, ISO 8601 timestamp (e.g., 2024-01-01T00:00:00.000Z)"
          ),
        max_transaction_timestamp: isoTimestamp
          .describe(
            "End of range, ISO 8601 timestamp (e.g., 2024-01-31T23:59:59.999Z)"
          ),
      },
    },
    async ({
      account_uid,
      category_uid,
      min_transaction_timestamp,
      max_transaction_timestamp,
    }) => {
      logToolCall("starling_list_feed_items_between", {
        account_uid,
        category_uid,
        min_transaction_timestamp,
        max_transaction_timestamp,
      });
      try {
        const result = await client.get(
          `/api/v2/feed/account/${account_uid}/category/${category_uid}/transactions-between`,
          buildParams({
            minTransactionTimestamp: min_transaction_timestamp,
            maxTransactionTimestamp: max_transaction_timestamp,
          })
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_update_feed_item_note",
    {
      title: "Update Feed Item Note",
      description:
        "Update the user note on a transaction feed item. Requires the feed item UID.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        category_uid: uid.describe("The category UID"),
        feed_item_uid: uid.describe("The feed item UID"),
        note: z.string().describe("The note text to set on the feed item"),
      },
    },
    async ({ account_uid, category_uid, feed_item_uid, note }) => {
      logToolCall("starling_update_feed_item_note", {
        account_uid,
        category_uid,
        feed_item_uid,
      });
      try {
        const result = await client.putJson(
          `/api/v2/feed/account/${account_uid}/category/${category_uid}/${feed_item_uid}/user-note`,
          { userNote: note }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_update_spending_category",
    {
      title: "Update Feed Item Spending Category",
      description:
        "Change the spending category of a transaction feed item. Valid categories include: BILLS_AND_SERVICES, CHARITY, EATING_OUT, ENTERTAINMENT, EXPENSES, FAMILY, GENERAL, GIFTS, GROCERIES, HOME, INCOME, SAVING, SHOPPING, HOLIDAYS, PAYMENTS, PETS, TRANSPORT, LIFESTYLE, NONE, REVENUE, OTHER_INCOME, CLIENT_REFUNDS, INVENTORY, STAFF, TRAVEL, WORKPLACE, REPAIRS_AND_MAINTENANCE, ADMIN, MARKETING, BUSINESS_ENTERTAINMENT, INTEREST_PAYMENTS, BANK_CHARGES, OTHER, FOOD_AND_DRINK, EQUIPMENT, PROFESSIONAL_SERVICES, PHONE_AND_INTERNET, VEHICLES, DIRECTORS_WAGES, VAT, CORPORATION_TAX, SELF_ASSESSMENT_TAX, INVESTMENT_CAPITAL, TRANSFERS, LOAN_PRINCIPAL, PERSONAL, DIVIDENDS.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        category_uid: uid.describe("The category UID"),
        feed_item_uid: uid.describe("The feed item UID"),
        spending_category: z
          .string()
          .describe("The spending category to assign (e.g., GROCERIES, TRANSPORT)"),
      },
    },
    async ({
      account_uid,
      category_uid,
      feed_item_uid,
      spending_category,
    }) => {
      logToolCall("starling_update_spending_category", {
        account_uid,
        category_uid,
        feed_item_uid,
        spending_category,
      });
      try {
        const result = await client.putJson(
          `/api/v2/feed/account/${account_uid}/category/${category_uid}/${feed_item_uid}/spending-category`,
          { spendingCategory: spending_category }
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_list_feed_item_attachments",
    {
      title: "List Feed Item Attachments",
      description: "List attachments on a transaction feed item.",
      inputSchema: {
        account_uid: uid.describe("The account UID"),
        category_uid: uid.describe("The category UID"),
        feed_item_uid: uid.describe("The feed item UID"),
      },
    },
    async ({ account_uid, category_uid, feed_item_uid }) => {
      logToolCall("starling_list_feed_item_attachments", {
        account_uid,
        category_uid,
        feed_item_uid,
      });
      try {
        const result = await client.get(
          `/api/v2/feed/account/${account_uid}/category/${category_uid}/${feed_item_uid}/attachments`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
