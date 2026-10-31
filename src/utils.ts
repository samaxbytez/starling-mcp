export function jsonResponse(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
}

export function errorResponse(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text" as const, text: `Error: ${msg}` }],
    isError: true,
  };
}

export function buildParams(
  obj: Record<string, unknown>
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) params[k] = String(v);
  }
  return params;
}

export function logToolCall(tool: string, params?: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = {
    ts: new Date().toISOString(),
    tool,
  };
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      sanitized[k] =
        typeof v === "string" && v.length > 100 ? v.slice(0, 20) + "..." : v;
    }
  }
  console.error(JSON.stringify(sanitized));
}

export function definedOnly<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}
