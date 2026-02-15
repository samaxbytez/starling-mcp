import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StarlingClient } from "../client.js";
import { jsonResponse, errorResponse, logToolCall } from "../utils.js";

export function registerDirectDebitTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_list_direct_debit_mandates",
    {
      title: "List Direct Debit Mandates",
      description:
        "List all direct debit mandates. Returns originator name, reference, status, and creation date.",
    },
    async () => {
      logToolCall("starling_list_direct_debit_mandates");
      try {
        const result = await client.get("/api/v2/direct-debit/mandates");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_direct_debit_mandate",
    {
      title: "Get Direct Debit Mandate",
      description:
        "Get details of a specific direct debit mandate by its UID.",
      inputSchema: {
        mandate_uid: z.string().describe("The direct debit mandate UID"),
      },
    },
    async ({ mandate_uid }) => {
      logToolCall("starling_get_direct_debit_mandate", { mandate_uid });
      try {
        const result = await client.get(
          `/api/v2/direct-debit/mandates/${mandate_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_cancel_direct_debit_mandate",
    {
      title: "Cancel Direct Debit Mandate",
      description:
        "Cancel a direct debit mandate. This will stop future payments under this mandate.",
      inputSchema: {
        mandate_uid: z
          .string()
          .describe("The direct debit mandate UID to cancel"),
      },
    },
    async ({ mandate_uid }) => {
      logToolCall("starling_cancel_direct_debit_mandate", { mandate_uid });
      try {
        const result = await client.deleteReq(
          `/api/v2/direct-debit/mandates/${mandate_uid}`
        );
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
