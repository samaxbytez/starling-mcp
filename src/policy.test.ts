import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StarlingClient } from "./client.js";
import { annotationsFor, SENSITIVE_TOOLS, withToolPolicy } from "./policy.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerAccountHolderTools } from "./tools/account-holder.js";
import { registerFeedTools } from "./tools/feed.js";
import { registerSavingsGoalTools } from "./tools/savings-goals.js";
import { registerPayeeTools } from "./tools/payees.js";
import { registerPaymentTools } from "./tools/payments.js";
import { registerStandingOrderTools } from "./tools/standing-orders.js";
import { registerDirectDebitTools } from "./tools/direct-debits.js";
import { registerCardTools } from "./tools/cards.js";
import { registerSpendingInsightTools } from "./tools/spending-insights.js";

function build(allowSensitive: boolean) {
  const raw = new McpServer({ name: "t", version: "0" });
  const server = withToolPolicy(raw, { allowSensitive });
  const client = {} as StarlingClient;
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
  return (raw as any)._registeredTools as Record<
    string,
    { annotations?: Record<string, boolean>; enabled: boolean }
  >;
}

describe("tool policy", () => {
  it("does not register sensitive tools by default", () => {
    const tools = build(false);
    for (const name of SENSITIVE_TOOLS) expect(tools[name]).toBeUndefined();
    expect(Object.keys(tools)).toHaveLength(50 - SENSITIVE_TOOLS.size);
  });

  it("registers all 50 tools when opted in, and every sensitive name exists", () => {
    const tools = build(true);
    expect(Object.keys(tools)).toHaveLength(50);
    for (const name of SENSITIVE_TOOLS) expect(tools[name]).toBeDefined();
  });

  it("annotates every tool", () => {
    for (const [name, tool] of Object.entries(build(true))) {
      expect(tool.annotations, name).toBeDefined();
    }
  });

  it("marks reads read-only and sends open-world", () => {
    expect(annotationsFor("starling_list_payees").readOnlyHint).toBe(true);
    expect(annotationsFor("starling_get_balance").readOnlyHint).toBe(true);
    expect(annotationsFor("starling_spending_by_category").readOnlyHint).toBe(true);
    expect(annotationsFor("starling_confirmation_of_funds").readOnlyHint).toBe(true);
    expect(annotationsFor("starling_make_local_payment").openWorldHint).toBe(true);
    expect(annotationsFor("starling_cancel_standing_order").destructiveHint).toBe(true);
    expect(annotationsFor("starling_enable_card").destructiveHint).toBe(true);
  });

  it("never marks a write read-only", () => {
    for (const [name, tool] of Object.entries(build(true))) {
      const readish = /^starling_(list|get|spending|confirmation)_?/.test(name);
      expect(tool.annotations?.readOnlyHint === true, name).toBe(readish);
    }
  });
});
