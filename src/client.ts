const BASE_URL = "https://api.starlingbank.com";

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

function parseApiError(status: number, body: string): StarlingApiError {
  try {
    const parsed = JSON.parse(body);
    const code = parsed?.error ?? parsed?.code ?? "unknown";
    const message =
      parsed?.errors?.[0]?.message ??
      parsed?.message ??
      parsed?.error_description ??
      `HTTP ${status}`;
    return new StarlingApiError(status, code, message);
  } catch {
    return new StarlingApiError(status, "unknown", `HTTP ${status} error`);
  }
}

function encodeFormBody(data: Record<string, string>): string {
  return new URLSearchParams(data).toString();
}

export class StarlingClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
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
    const url = new URL(path, BASE_URL);

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
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
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw parseApiError(response.status, errorBody);
    }

    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  }
}
