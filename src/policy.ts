import type { McpServer, RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

// Tools that move money, add a destination for money, or change what can be
// debited from the account. Text returned by Starling (payee names, payment
// references, feed notes) can be written by third parties, so an injected
// instruction must not be able to reach these unless the user has opted in.
export const SENSITIVE_TOOLS = new Set([
  "starling_make_local_payment",
  "starling_create_payee",
  "starling_create_standing_order",
  "starling_add_money_to_savings_goal",
  "starling_withdraw_from_savings_goal",
  "starling_delete_savings_goal",
  "starling_cancel_direct_debit_mandate",
]);

// Both directions of a savings-goal transfer are gated: withdrawing moves
// money to the main account, where the other tools can then spend it.

export function annotationsFor(name: string): ToolAnnotations {
  const action = name.replace(/^starling_/, "").split("_")[0];

  if (action === "list" || action === "get" || action === "spending" || action === "confirmation") {
    return { readOnlyHint: true, openWorldHint: false };
  }
  if (name === "starling_make_local_payment" || name === "starling_create_standing_order") {
    // Sends money to a third party.
    return { readOnlyHint: false, destructiveHint: false, openWorldHint: true };
  }
  if (
    action === "delete" ||
    action === "cancel" ||
    action === "withdraw" ||
    action === "update" ||
    action === "enable"
  ) {
    return { readOnlyHint: false, destructiveHint: true, openWorldHint: false };
  }
  return { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
}

/**
 * Wraps the server so every tool registered through it gets MCP annotations,
 * and sensitive tools are dropped unless `allowSensitive` is set.
 */
export function withToolPolicy(
  server: McpServer,
  options: { allowSensitive: boolean }
): McpServer {
  return new Proxy(server, {
    get(target, prop, receiver) {
      if (prop === "tool" || prop === "registerTool") {
        const original = Reflect.get(target, prop, receiver) as (
          ...args: unknown[]
        ) => RegisteredTool;
        return (...args: unknown[]) => {
          const name = args[0] as string;
          const registered = original.apply(target, args);
          if (SENSITIVE_TOOLS.has(name) && !options.allowSensitive) {
            registered.remove();
          } else {
            registered.update({ annotations: annotationsFor(name) });
          }
          return registered;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}
