export interface Config {
  accessToken: string;
  baseUrl: string;
  sandbox: boolean;
}

const LIVE_URL = "https://api.starlingbank.com";
const SANDBOX_URL = "https://api-sandbox.starlingbank.com";

// For tests against a local fake API. The bearer token goes to this URL, so
// only https or loopback http is accepted.
function baseUrlOverride(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const url = new URL(value);
  const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
    throw new Error("STARLING_API_BASE_URL must be https, or http on loopback");
  }
  return url.origin;
}

// Sandbox and live tokens come from different variables, so a sandbox token
// can never be sent to the live API, or a live token to the sandbox.
export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const sandbox = env.STARLING_ENV === "sandbox";
  if (env.STARLING_ENV && env.STARLING_ENV !== "sandbox" && env.STARLING_ENV !== "production") {
    throw new Error('STARLING_ENV must be "sandbox" or "production"');
  }
  const name = sandbox ? "STARLING_SANDBOX_ACCESS_TOKEN" : "STARLING_ACCESS_TOKEN";
  const accessToken = env[name];
  if (!accessToken) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return {
    accessToken,
    baseUrl: baseUrlOverride(env.STARLING_API_BASE_URL) ?? (sandbox ? SANDBOX_URL : LIVE_URL),
    sandbox,
  };
}
