import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StarlingClient, StarlingApiError } from "./client.js";

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockOk(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  } as Response;
}

function mockError(status: number, body: unknown): Response {
  return {
    ok: false,
    status,
    headers: new Headers(status === 429 ? { "retry-after": "7" } : {}),
    text: async () =>
      typeof body === "string" ? body : JSON.stringify(body),
  } as Response;
}

describe("StarlingClient - GET", () => {
  it("sends Authorization header", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ data: "ok" }));
    const client = new StarlingClient("test-token");
    await client.get("/api/v2/accounts");

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v2/accounts");
    expect(opts.headers.Authorization).toBe("Bearer test-token");
  });

  it("sends Accept header", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ data: "ok" }));
    const client = new StarlingClient("token");
    await client.get("/api/v2/accounts");

    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect((opts.headers as Record<string, string>).Accept).toBe(
      "application/json"
    );
  });

  it("appends query params", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ data: "ok" }));
    const client = new StarlingClient("token");
    await client.get("/api/v2/feed", {
      changesSince: "2024-01-01T00:00:00.000Z",
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("changesSince=2024-01-01T00%3A00%3A00.000Z");
  });

  it("handles empty response body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "",
    } as Response);
    const client = new StarlingClient("token");
    const result = await client.get("/api/v2/test");
    expect(result).toEqual({});
  });
});

describe("StarlingClient - POST", () => {
  it("sends JSON body for postJson", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ data: "ok" }));
    const client = new StarlingClient("token");
    await client.postJson("/api/v2/test", { amount: 100 });

    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe("POST");
    expect((opts.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json"
    );
    expect(opts.body).toBe('{"amount":100}');
  });

  it("sends form body for postForm", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ data: "ok" }));
    const client = new StarlingClient("token");
    await client.postForm("/api/v2/test", { key: "value" });

    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect((opts.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/x-www-form-urlencoded"
    );
    expect(opts.body).toBe("key=value");
  });
});

describe("StarlingClient - PUT", () => {
  it("sends JSON body for putJson", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ data: "ok" }));
    const client = new StarlingClient("token");
    await client.putJson("/api/v2/test", { enabled: true });

    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe("PUT");
    expect((opts.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json"
    );
    expect(opts.body).toBe('{"enabled":true}');
  });
});

describe("StarlingClient - DELETE", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({}));
    const client = new StarlingClient("token");
    await client.deleteReq("/api/v2/payees/abc-123");

    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect(opts.method).toBe("DELETE");
  });
});

describe("StarlingClient - error handling", () => {
  it("throws StarlingApiError with parsed Starling error format", async () => {
    mockFetch.mockResolvedValueOnce(
      mockError(400, {
        errors: [{ message: "endpoint called with non-individual account" }],
        success: false,
      })
    );

    const client = new StarlingClient("token");
    try {
      await client.get("/api/v2/test");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(StarlingApiError);
      const err = e as StarlingApiError;
      expect(err.status).toBe(400);
      expect(err.message).toContain(
        "endpoint called with non-individual account"
      );
    }
  });

  it("throws StarlingApiError with standard error format", async () => {
    mockFetch.mockResolvedValueOnce(
      mockError(401, { error: "invalid_token", message: "Token expired" })
    );

    const client = new StarlingClient("token");
    try {
      await client.get("/api/v2/test");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(StarlingApiError);
      const err = e as StarlingApiError;
      expect(err.status).toBe(401);
      expect(err.errorCode).toBe("invalid_token");
    }
  });

  it("returns safe fallback for malformed error body", async () => {
    mockFetch.mockResolvedValueOnce(mockError(500, "not json"));

    const client = new StarlingClient("token");
    try {
      await client.get("/api/v2/test");
      expect.fail("should have thrown");
    } catch (e) {
      const err = e as StarlingApiError;
      expect(err.errorCode).toBe("unknown");
      expect(err.message).not.toContain("not json");
    }
  });

  it("handles 429 rate limit error", async () => {
    mockFetch.mockResolvedValueOnce(
      mockError(429, { message: "Too many requests" })
    );

    const client = new StarlingClient("token");
    try {
      await client.get("/api/v2/test");
      expect.fail("should have thrown");
    } catch (e) {
      const err = e as StarlingApiError;
      expect(err.status).toBe(429);
      expect(err.message).toContain("retry after 7 seconds");
    }
  });
});

describe("StarlingClient - path safety", () => {
  const hostile = [
    "/api/v2/../../evil",
    "/api/v2/%2e%2e/%2e%2e/evil",
    "/api/v2/%2E%2E/x",
    "/api/v2/..%2fx",
    "/api/v2/a%5cb",
    "https://evil.example/api/v2/x",
    "//evil.example/api/v2/x",
    "javascript:alert(1)",
    "/other/path",
  ];

  for (const path of hostile) {
    it(`rejects ${path}`, async () => {
      const client = new StarlingClient("token");
      await expect(client.get(path)).rejects.toThrow();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  }

  it("refuses redirects and sets a timeout", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({}));
    await new StarlingClient("token").get("/api/v2/accounts");
    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect(opts.redirect).toBe("error");
    expect(opts.signal).toBeInstanceOf(AbortSignal);
  });

  it("keeps every validation message", async () => {
    mockFetch.mockResolvedValueOnce(
      mockError(400, { errors: [{ message: "bad a" }, { message: "bad b" }] })
    );
    await expect(
      new StarlingClient("token").get("/api/v2/x")
    ).rejects.toThrow(/bad a; bad b/);
  });
});
