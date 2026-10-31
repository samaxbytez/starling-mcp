// Starts the bundled build/index.js over MCP stdio, exactly as an MCP client
// does, and checks it works. Type-check and vitest run the TypeScript sources,
// so they can't see failures that only exist in the bundle (CommonJS interop,
// a dependency that breaks when bundled). Run after `npm run build`.
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures = [];
const check = (ok, message) => ok || failures.push(message);

const runtimeDeps = Object.keys(pkg.dependencies ?? {});
check(
  runtimeDeps.length === 0,
  `package.json has runtime dependencies (${runtimeDeps.join(", ")}); they belong in the bundle`
);

async function listTools(env) {
  const client = new Client({ name: "smoke", version: "0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: ["build/index.js"],
      // A dummy token: listing tools makes no API calls.
      env: { PATH: process.env.PATH ?? "", ...env },
      stderr: "ignore",
    })
  );
  const info = client.getServerVersion();
  const { tools } = await client.listTools();
  await client.close();
  return { info, tools };
}

const { info, tools } = await listTools({ STARLING_ACCESS_TOKEN: "smoke-test" });
check(info?.version === pkg.version, `server reports version ${info?.version}, package.json says ${pkg.version}`);
check(tools.length >= 40, `only ${tools.length} tools registered`);

const sandbox = await listTools({ STARLING_ENV: "sandbox", STARLING_SANDBOX_ACCESS_TOKEN: "smoke-test" });
check(sandbox.tools.length === tools.length, "sandbox mode registers a different tool set");

if (failures.length) {
  console.error(`Smoke test failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`Smoke test passed: ${info.name} ${info.version}, ${tools.length} tools`);
