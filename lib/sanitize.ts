/**
 * Escape HTML special characters to prevent XSS.
 * Covers the five characters that matter in HTML contexts.
 */
export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Recursively apply escapeHTML to every string value in a plain object.
 * Non-string values (numbers, booleans, dates, nested objects/arrays) are
 * traversed but left as-is.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return escapeHTML(obj) as T;
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
