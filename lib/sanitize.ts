/**
 * Normalize plain text stored in the database.
 * React escapes text nodes safely at render time, so persistence should keep
 * raw user text instead of storing HTML entities.
 */
export function normalizePlainText(str: string): string {
  return str.replace(/\r\n/g, "\n").replace(/\u0000/g, "");
}

/**
 * Decode legacy escaped HTML entities that were previously stored in the DB.
 * This is intentionally limited to the entities produced by the old write path.
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Recursively normalize plain string values in a plain object.
 * Non-string values (numbers, booleans, dates, nested objects/arrays) are
 * traversed but left as-is.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return normalizePlainText(obj) as T;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = sanitizeObject(value);
    }
    return result as T;
  }

  return obj;
}

export function decodeLegacyEscapedContent<T>(obj: T): T {
  if (typeof obj === "string") {
    return decodeHtmlEntities(obj) as T;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => decodeLegacyEscapedContent(item)) as T;
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = decodeLegacyEscapedContent(value);
    }
    return result as T;
  }

  return obj;
}
