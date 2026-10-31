import { z } from "zod";

// Starling identifiers are UUIDs. They are interpolated into request paths, so
// anything else (../, %2e%2e/, ?, #) must be rejected before it gets that far.
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const uid = z.string().regex(UUID, "Must be a UUID");

export const currency = z
  .string()
  .regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code, e.g. GBP");
export const year = z.string().regex(/^\d{4}$/, "Must be a 4-digit year");
export const month = z
  .string()
  .regex(/^(0[1-9]|1[0-2])$/, "Must be a two-digit month, 01-12");
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");
export const isoTimestamp = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})$/, "Must be an ISO 8601 timestamp");
