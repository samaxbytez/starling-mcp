// Live attack test. Runs build/index.js over MCP stdio against a fake local
// Starling API plus a second "evil" listener, and fires hostile values at every
// string argument of every tool. Asserts that every request that reaches the
// API stays under /api/v2/, carries no injected headers or query keys, and that
// the bearer token never reaches the evil host, even when the API redirects.
import http from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const TOKEN = "attack-test-token";
const HOSTILE = [
  "../x",
  "..%2fx",
  "%2e%2e/x",
  "%2E%2E%2F%2E%2E%2Fevil",
  "1?inj=1",
  "1#x",
  "a/b",
  "https://evil.example/x",
  "//evil.example/x",
  "＠evil.example",
  "x\r\nX-Injected: 1",
  "x\u0000y",
  "A".repeat(5000),
  "123e4567-e89b-12d3-a456-426614174000/../../x",
  "123e4567-e89b-12d3-a456-426614174000?inj=1",
];
const VALID = "123e4567-e89b-12d3-a456-426614174000";

const listen = (handler) =>
  new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

const apiRequests = [];
const evilRequests = [];
let redirectMode = false;

const evil = await listen((req, res) => {
  evilRequests.push({ url: req.url, auth: req.headers.authorization });
  res.end("{}");
});
const evilUrl = `http://127.0.0.1:${evil.address().port}/steal`;
const api = await listen((req, res) => {
  apiRequests.push({ url: req.url, headers: req.headers });
  if (redirectMode) {
    res.writeHead(302, { Location: evilUrl }).end();
  } else {
    res.setHeader("content-type", "application/json").end("{}");
  }
});

const client = new Client({ name: "attack", version: "0" });
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: ["build/index.js"],
    env: {
      PATH: process.env.PATH ?? "",
      STARLING_ACCESS_TOKEN: TOKEN,
      STARLING_API_BASE_URL: `http://127.0.0.1:${api.address().port}`,
    },
    stderr: "ignore",
  })
);
const { tools } = await client.listTools();

function validValue(key, schema) {
  if (schema.enum) return schema.enum[0];
  if (schema.type === "boolean") return true;
  if (schema.type === "number" || schema.type === "integer") return 1;
  if (key.endsWith("_uid")) return VALID;
  if (key === "currency") return "GBP";
  if (key === "year") return "2024";
  if (key === "month") return "01";
  if (key === "sort_code") return "123456";
  if (key === "account_number") return "12345678";
  if (/timestamp|changes_since/.test(key)) return "2024-01-01T00:00:00.000Z";
  if (key.endsWith("date")) return "2024-01-01";
  return "x";
}

let calls = 0;
async function fire(tool, args) {
  calls++;
  await client.callTool({ name: tool.name, arguments: args }).catch(() => {});
}

for (const tool of tools) {
  const props = tool.inputSchema.properties ?? {};
  const base = Object.fromEntries(
    Object.entries(props).map(([k, s]) => [k, validValue(k, s)])
  );
  await fire(tool, base);
  for (const [key, schema] of Object.entries(props)) {
    if (schema.type !== "string" || schema.enum) continue;
    for (const payload of HOSTILE) {
      await fire(tool, { ...base, [key]: payload });
    }
  }
  // Extra keys must be ignored, never forwarded.
  await fire(tool, JSON.parse(`{"__proto__":{"x":1},"constructor":{"x":1},"inj":"1"}`));
  await fire(tool, { ...base, __proto__x: 1, constructor: { prototype: { x: 1 } } });
}

// Phase 2: the API answers every request with a redirect to the evil host.
redirectMode = true;
for (const tool of tools) {
  const props = tool.inputSchema.properties ?? {};
  const base = Object.fromEntries(
    Object.entries(props).map(([k, s]) => [k, validValue(k, s)])
  );
  await fire(tool, base);
}

await client.close();
api.close();
evil.close();

const failures = [];
for (const r of apiRequests) {
  const url = new URL(r.url, "http://x");
  if (!url.pathname.startsWith("/api/v2/")) failures.push(`left base path: ${r.url}`);
  if (url.pathname.includes("..")) failures.push(`dot segment in path: ${r.url}`);
  if (url.searchParams.has("inj")) failures.push(`injected query key: ${r.url}`);
  if (Object.keys(r.headers).some((h) => h.toLowerCase() === "x-injected"))
    failures.push(`injected header on ${r.url}`);
}
for (const r of evilRequests) failures.push(`evil host got a request: ${r.url} auth=${r.auth}`);

if (failures.length) {
  console.error(`Attack test FAILED:\n- ${[...new Set(failures)].slice(0, 30).join("\n- ")}`);
  process.exit(1);
}
console.log(
  `Attack test passed: ${calls} calls, ${apiRequests.length} reached the fake API, 0 reached the evil host`
);
