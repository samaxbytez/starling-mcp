const DEFAULT_BASE_URL = "https://api.starlingbank.com";
const REQUEST_TIMEOUT_MS = 30_000;

export class StarlingApiError extends Error {
  public readonly status: number;
  public readonly errorCode: string;

  constructor(status: number, errorCode: string, message: string) {
    super(`Starling API error (${status}): ${errorCode} - ${message}`);
    this.name = "StarlingApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

function parseApiError(response: Response, body: string): StarlingApiError {
  const { status } = response;
  if (status === 429) {
    const retryAfter = response.headers?.get("retry-after");
    return new StarlingApiError(
      status,
      "rate_limited",
      `Starling rate limit reached${retryAfter ? `; retry after ${retryAfter} seconds` : ""}`
    );
  }
  try {
    const parsed = JSON.parse(body);
    const code = parsed?.error ?? parsed?.code ?? "unknown";
    // Keep every validation message so the model can correct its call.
    const listed = Array.isArray(parsed?.errors)
      ? parsed.errors
          .map((e: { message?: string }) => e?.message)
          .filter(Boolean)
          .join("; ")
      : undefined;
    const message =
      listed ||
      parsed?.message ||
      parsed?.error_description ||
      `HTTP ${status}`;
    return new StarlingApiError(status, code, message);
  } catch {
    // Not JSON (e.g. a proxy's HTML page): don't echo it to the model.
    return new StarlingApiError(status, "unknown", `HTTP ${status} error`);
  }
}

function encodeFormBody(data: Record<string, string>): string {
  return new URLSearchParams(data).toString();
}

export class StarlingClient {
  private accessToken: string;
  private base: URL;

  constructor(accessToken: string, baseUrl?: string) {
    this.accessToken = accessToken;
    this.base = new URL(baseUrl || DEFAULT_BASE_URL);
  }

  async get<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("GET", path, undefined, undefined, params);
  }

  async postForm<T = unknown>(
    path: string,
    body?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("POST", path, body, "form");
  }

  async postJson<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body, "json");
  }

  async putForm<T = unknown>(
    path: string,
    body?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("PUT", path, body, "form");
  }

  async putJson<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body, "json");
  }

  async patchForm<T = unknown>(
    path: string,
    body?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("PATCH", path, body, "form");
  }

  async patchJson<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body, "json");
  }

  async deleteReq<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("DELETE", path, undefined, undefined, params);
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    bodyType?: "form" | "json",
    params?: Record<string, string>
  ): Promise<T> {
    if (/%2e|%2f|%5c/i.test(path) || /\.\.[\\/]/.test(path) || /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) {
      throw new Error(`Unsafe API path rejected: ${path}`);
    }

    const url = new URL(path, this.base);

    if (url.origin !== this.base.origin) {
      throw new Error(`Resolved URL origin does not match base: ${url.origin}`);
    }

    // The raw-string check misses encoded dot segments (%2e%2e/), which the
    // URL parser still resolves as "..". Check the resolved path too.
    if (!url.pathname.startsWith("/api/v2/")) {
      throw new Error(`Resolved URL escapes /api/v2/: ${url.pathname}`);
    }

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
      "User-Agent": "starling-mcp",
    };

    let encodedBody: string | undefined;

    if (body && bodyType === "json") {
      headers["Content-Type"] = "application/json";
      encodedBody = JSON.stringify(body);
    } else if (body && bodyType === "form") {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      encodedBody = encodeFormBody(body as Record<string, string>);
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: encodedBody,
      // Never forward the bearer token to a redirect target.
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw parseApiError(response, await response.text());
    }

    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  }
}
