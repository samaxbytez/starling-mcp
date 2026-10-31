import { describe, it, expect } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("uses the live API and STARLING_ACCESS_TOKEN by default", () => {
    expect(loadConfig({ STARLING_ACCESS_TOKEN: "live" })).toEqual({
      accessToken: "live",
      baseUrl: "https://api.starlingbank.com",
      sandbox: false,
    });
  });

  it("uses the sandbox API and its own token variable", () => {
    const c = loadConfig({
      STARLING_ENV: "sandbox",
      STARLING_SANDBOX_ACCESS_TOKEN: "sbx",
      STARLING_ACCESS_TOKEN: "live",
    });
    expect(c.accessToken).toBe("sbx");
    expect(c.baseUrl).toBe("https://api-sandbox.starlingbank.com");
  });

  it("never falls back to the live token in sandbox mode", () => {
    expect(() =>
      loadConfig({ STARLING_ENV: "sandbox", STARLING_ACCESS_TOKEN: "live" })
    ).toThrow(/STARLING_SANDBOX_ACCESS_TOKEN/);
  });

  it("rejects an unknown environment", () => {
    expect(() =>
      loadConfig({ STARLING_ENV: "staging", STARLING_ACCESS_TOKEN: "x" })
    ).toThrow(/STARLING_ENV/);
  });

  it("accepts a loopback http override and rejects remote http", () => {
    const env = { STARLING_ACCESS_TOKEN: "x" };
    expect(
      loadConfig({ ...env, STARLING_API_BASE_URL: "http://127.0.0.1:9000/ignored" }).baseUrl
    ).toBe("http://127.0.0.1:9000");
    expect(() =>
      loadConfig({ ...env, STARLING_API_BASE_URL: "http://evil.example" })
    ).toThrow(/https/);
  });
});
