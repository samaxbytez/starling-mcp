import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StarlingClient } from "../client.js";
import { jsonResponse, errorResponse, logToolCall } from "../utils.js";

export function registerAccountHolderTools(
  server: McpServer,
  client: StarlingClient
): void {
  server.registerTool(
    "starling_get_account_holder",
    {
      title: "Get Account Holder",
      description:
        "Get basic information about the account holder. Returns the account holder type (individual, joint, business).",
    },
    async () => {
      logToolCall("starling_get_account_holder");
      try {
        const result = await client.get("/api/v2/account-holder");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_account_holder_name",
    {
      title: "Get Account Holder Name",
      description: "Get the name of the account holder.",
    },
    async () => {
      logToolCall("starling_get_account_holder_name");
      try {
        const result = await client.get("/api/v2/account-holder/name");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_individual",
    {
      title: "Get Individual Account Holder",
      description:
        "Get details of an individual account holder. Returns name, date of birth, email, phone.",
    },
    async () => {
      logToolCall("starling_get_individual");
      try {
        const result = await client.get("/api/v2/account-holder/individual");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_joint_account",
    {
      title: "Get Joint Account Holder",
      description: "Get details of a joint account holder.",
    },
    async () => {
      logToolCall("starling_get_joint_account");
      try {
        const result = await client.get("/api/v2/account-holder/joint");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_business",
    {
      title: "Get Business Account Holder",
      description:
        "Get details of a business account holder. Returns company name, registration, type.",
    },
    async () => {
      logToolCall("starling_get_business");
      try {
        const result = await client.get("/api/v2/account-holder/business");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "starling_get_addresses",
    {
      title: "Get Addresses",
      description:
        "Get the current and previous addresses of the account holder.",
    },
    async () => {
      logToolCall("starling_get_addresses");
      try {
        const result = await client.get("/api/v2/addresses");
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
