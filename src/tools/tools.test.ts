import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { StarlingClient } from "../client.js";
import { registerAccountTools } from "./accounts.js";
import { registerAccountHolderTools } from "./account-holder.js";
import { registerFeedTools } from "./feed.js";
import { registerSavingsGoalTools } from "./savings-goals.js";
import { registerPayeeTools } from "./payees.js";
import { registerPaymentTools } from "./payments.js";
import { registerStandingOrderTools } from "./standing-orders.js";
import { registerDirectDebitTools } from "./direct-debits.js";
import { registerCardTools } from "./cards.js";
import { registerSpendingInsightTools } from "./spending-insights.js";

type ToolHandler = (...args: any[]) => any;

function createMockServer() {
  const tools = new Map<string, ToolHandler>();
  return {
    server: {
      registerTool: vi.fn(
        (name: string, _config: unknown, cb: ToolHandler) => {
          tools.set(name, cb);
        }
      ),
    } as any,
    tools,
  };
}

function createMockClient() {
  return {
    get: vi.fn().mockResolvedValue({ data: "mock" }),
    postForm: vi.fn().mockResolvedValue({ data: "mock" }),
    postJson: vi.fn().mockResolvedValue({ data: "mock" }),
    putForm: vi.fn().mockResolvedValue({ data: "mock" }),
    putJson: vi.fn().mockResolvedValue({ data: "mock" }),
    patchForm: vi.fn().mockResolvedValue({ data: "mock" }),
    patchJson: vi.fn().mockResolvedValue({ data: "mock" }),
    deleteReq: vi.fn().mockResolvedValue({ data: "mock" }),
  } as unknown as StarlingClient;
}

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe("registerAccountTools", () => {
  it("registers 5 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerAccountTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(5);
  });

  it("starling_list_accounts calls client.get and returns jsonResponse", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerAccountTools(server, client);

    const handler = tools.get("starling_list_accounts")!;
    const result = await handler({});

    expect(client.get).toHaveBeenCalledWith("/api/v2/accounts");
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ data: "mock" });
  });

  it("starling_get_balance passes account_uid in path", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerAccountTools(server, client);

    const handler = tools.get("starling_get_balance")!;
    await handler({ account_uid: "acc-123" });

    expect(client.get).toHaveBeenCalledWith(
      "/api/v2/accounts/acc-123/balance"
    );
  });

  it("returns errorResponse when client throws", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    (client.get as any).mockRejectedValue(new Error("connection failed"));
    registerAccountTools(server, client);

    const handler = tools.get("starling_list_accounts")!;
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Error: connection failed");
  });
});

describe("registerAccountHolderTools", () => {
  it("registers 6 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerAccountHolderTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(6);
  });

  it("starling_get_account_holder calls correct endpoint", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerAccountHolderTools(server, client);

    const handler = tools.get("starling_get_account_holder")!;
    await handler({});

    expect(client.get).toHaveBeenCalledWith("/api/v2/account-holder");
  });
});

describe("registerFeedTools", () => {
  it("registers 6 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerFeedTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(6);
  });

  it("starling_list_feed_items passes changesSince param", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerFeedTools(server, client);

    const handler = tools.get("starling_list_feed_items")!;
    await handler({
      account_uid: "acc-1",
      category_uid: "cat-1",
      changes_since: "2024-01-01T00:00:00.000Z",
    });

    expect(client.get).toHaveBeenCalledWith(
      "/api/v2/feed/account/acc-1/category/cat-1",
      { changesSince: "2024-01-01T00:00:00.000Z" }
    );
  });

  it("starling_list_feed_items_between passes timestamp params", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerFeedTools(server, client);

    const handler = tools.get("starling_list_feed_items_between")!;
    await handler({
      account_uid: "acc-1",
      category_uid: "cat-1",
      min_transaction_timestamp: "2024-01-01T00:00:00.000Z",
      max_transaction_timestamp: "2024-01-31T23:59:59.999Z",
    });

    expect(client.get).toHaveBeenCalledWith(
      "/api/v2/feed/account/acc-1/category/cat-1/transactions-between",
      {
        minTransactionTimestamp: "2024-01-01T00:00:00.000Z",
        maxTransactionTimestamp: "2024-01-31T23:59:59.999Z",
      }
    );
  });

  it("starling_update_feed_item_note calls putJson", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerFeedTools(server, client);

    const handler = tools.get("starling_update_feed_item_note")!;
    await handler({
      account_uid: "acc-1",
      category_uid: "cat-1",
      feed_item_uid: "feed-1",
      note: "Test note",
    });

    expect(client.putJson).toHaveBeenCalledWith(
      "/api/v2/feed/account/acc-1/category/cat-1/feed-1/user-note",
      { userNote: "Test note" }
    );
  });
});

describe("registerSavingsGoalTools", () => {
  it("registers 7 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerSavingsGoalTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(7);
  });

  it("starling_add_money_to_savings_goal sends correct body", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerSavingsGoalTools(server, client);

    const handler = tools.get("starling_add_money_to_savings_goal")!;
    await handler({
      account_uid: "acc-1",
      savings_goal_uid: "sg-1",
      transfer_uid: "tx-1",
      currency: "GBP",
      amount_minor_units: 5000,
    });

    expect(client.putJson).toHaveBeenCalledWith(
      "/api/v2/account/acc-1/savings-goals/sg-1/add-money/tx-1",
      { amount: { currency: "GBP", minorUnits: 5000 } }
    );
  });

  it("starling_delete_savings_goal calls deleteReq", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerSavingsGoalTools(server, client);

    const handler = tools.get("starling_delete_savings_goal")!;
    await handler({ account_uid: "acc-1", savings_goal_uid: "sg-1" });

    expect(client.deleteReq).toHaveBeenCalledWith(
      "/api/v2/account/acc-1/savings-goals/sg-1"
    );
  });
});

describe("registerPayeeTools", () => {
  it("registers 4 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerPayeeTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(4);
  });

  it("starling_list_payees calls correct endpoint", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerPayeeTools(server, client);

    const handler = tools.get("starling_list_payees")!;
    await handler({});

    expect(client.get).toHaveBeenCalledWith("/api/v2/payees");
  });
});

describe("registerPaymentTools", () => {
  it("registers 3 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerPaymentTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(3);
  });

  it("starling_make_local_payment sends correct body", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerPaymentTools(server, client);

    const handler = tools.get("starling_make_local_payment")!;
    await handler({
      account_uid: "acc-1",
      category_uid: "cat-1",
      payee_uid: "payee-1",
      payee_account_uid: "pa-1",
      currency: "GBP",
      amount_minor_units: 1000,
      reference: "Test payment",
    });

    expect(client.putJson).toHaveBeenCalledWith(
      "/api/v2/payments/local/account/acc-1/category/cat-1",
      {
        payeeUid: "payee-1",
        payeeAccountUid: "pa-1",
        amount: { currency: "GBP", minorUnits: 1000 },
        reference: "Test payment",
      }
    );
  });
});

describe("registerStandingOrderTools", () => {
  it("registers 5 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerStandingOrderTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(5);
  });

  it("starling_list_standing_orders calls correct endpoint", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerStandingOrderTools(server, client);

    const handler = tools.get("starling_list_standing_orders")!;
    await handler({ account_uid: "acc-1", category_uid: "cat-1" });

    expect(client.get).toHaveBeenCalledWith(
      "/api/v2/payments/local/account/acc-1/category/cat-1/standing-orders"
    );
  });
});

describe("registerDirectDebitTools", () => {
  it("registers 3 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerDirectDebitTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(3);
  });

  it("starling_list_direct_debit_mandates calls correct endpoint", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerDirectDebitTools(server, client);

    const handler = tools.get("starling_list_direct_debit_mandates")!;
    await handler({});

    expect(client.get).toHaveBeenCalledWith("/api/v2/direct-debit/mandates");
  });

  it("starling_cancel_direct_debit_mandate calls deleteReq", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerDirectDebitTools(server, client);

    const handler = tools.get("starling_cancel_direct_debit_mandate")!;
    await handler({ mandate_uid: "m-123" });

    expect(client.deleteReq).toHaveBeenCalledWith(
      "/api/v2/direct-debit/mandates/m-123"
    );
  });
});

describe("registerCardTools", () => {
  it("registers 8 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerCardTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(8);
  });

  it("starling_enable_card calls putJson with correct body", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerCardTools(server, client);

    const handler = tools.get("starling_enable_card")!;
    await handler({ card_uid: "card-1", enabled: false });

    expect(client.putJson).toHaveBeenCalledWith(
      "/api/v2/cards/card-1/controls/enabled",
      { enabled: false }
    );
  });
});

describe("registerSpendingInsightTools", () => {
  it("registers 3 tools", () => {
    const { server } = createMockServer();
    const client = createMockClient();
    registerSpendingInsightTools(server, client);
    expect(server.registerTool).toHaveBeenCalledTimes(3);
  });

  it("starling_spending_by_category passes year and month params", async () => {
    const { server, tools } = createMockServer();
    const client = createMockClient();
    registerSpendingInsightTools(server, client);

    const handler = tools.get("starling_spending_by_category")!;
    await handler({ account_uid: "acc-1", year: "2024", month: "06" });

    expect(client.get).toHaveBeenCalledWith(
      "/api/v2/accounts/acc-1/spending-insights/spending-category",
      { year: "2024", month: "06" }
    );
  });
});
