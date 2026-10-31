import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
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

const PAYLOADS = ["../x", "%2e%2e/x", "1?x", "1#x", "a/b", "..", "x\r\nHost: evil"];
const UUID = "123e4567-e89b-12d3-a456-426614174000";

type Registered = { shape: Record<string, z.ZodTypeAny>; cb: (a: any) => any };

function registerAll() {
  const tools = new Map<string, Registered>();
  const server = {
    registerTool: (name: string, config: any, cb: any) => {
      tools.set(name, { shape: config.inputSchema ?? {}, cb });
    },
  } as any;
  const client = {
    get: vi.fn().mockResolvedValue({}),
    putJson: vi.fn().mockResolvedValue({}),
    postJson: vi.fn().mockResolvedValue({}),
    patchJson: vi.fn().mockResolvedValue({}),
    deleteReq: vi.fn().mockResolvedValue({}),
  } as unknown as StarlingClient;
  for (const register of [
    registerAccountTools,
    registerAccountHolderTools,
    registerFeedTools,
    registerSavingsGoalTools,
    registerPayeeTools,
    registerPaymentTools,
    registerStandingOrderTools,
    registerDirectDebitTools,
    registerCardTools,
    registerSpendingInsightTools,
  ]) {
    register(server, client);
  }
  return tools;
}

// A valid value for every argument, so one hostile argument is tested at a time.
function validArgs(shape: Record<string, z.ZodTypeAny>) {
  const args: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(shape)) {
    const schema = field instanceof z.ZodOptional ? field.unwrap() : field;
    if (key.endsWith("_uid")) args[key] = UUID;
    else if (schema instanceof z.ZodBoolean) args[key] = true;
    else if (schema instanceof z.ZodNumber) args[key] = 1;
    else if (schema instanceof z.ZodEnum) args[key] = schema.options[0];
    else if (key === "currency") args[key] = "GBP";
    else if (key === "year") args[key] = "2024";
    else if (key === "month") args[key] = "01";
    else if (key.endsWith("timestamp") || key === "changes_since")
      args[key] = "2024-01-01T00:00:00.000Z";
    else if (key.endsWith("date")) args[key] = "2024-01-01";
    else if (key === "sort_code") args[key] = "123456";
    else if (key === "account_number") args[key] = "12345678";
    else args[key] = "x";
  }
  return args;
}

let errorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => errorSpy.mockRestore());

describe("path parameters reject traversal payloads", () => {
  const tools = registerAll();

  it("registers tools", () => {
    expect(tools.size).toBe(50);
  });

  for (const [name, { shape }] of tools) {
    const object = z.object(shape);
    it(`${name} accepts valid arguments`, () => {
      expect(object.safeParse(validArgs(shape)).success).toBe(true);
    });

    for (const key of Object.keys(shape).filter((k) => k.endsWith("_uid"))) {
      for (const payload of PAYLOADS) {
        it(`${name}.${key} rejects ${JSON.stringify(payload)}`, () => {
          const result = object.safeParse({ ...validArgs(shape), [key]: payload });
          expect(result.success).toBe(false);
        });
      }
    }
  }

  it("rejects non-date and non-code values for query/body fields", () => {
    const feed = z.object(tools.get("starling_list_feed_items_between")!.shape);
    expect(
      feed.safeParse({
        ...validArgs(tools.get("starling_list_feed_items_between")!.shape),
        min_transaction_timestamp: "1&inj=1",
      }).success
    ).toBe(false);
    const spend = z.object(tools.get("starling_spending_by_category")!.shape);
    expect(
      spend.safeParse({
        ...validArgs(tools.get("starling_spending_by_category")!.shape),
        month: "01&x=1",
      }).success
    ).toBe(false);
  });
});
