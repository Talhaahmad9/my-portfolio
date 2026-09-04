import { DatePrecision } from "@/lib/cms/types";

export interface NormalizedDateResult {
  date: Date | null;
  precision: DatePrecision | null;
}

/**
 * Server-safe parser & normalizer for CMS date inputs.
 * Constructs UTC Date instances adhering to precision level ("day" | "month" | "year").
 *
 * Normalization Rules:
 * - day: "2026-07-11" -> 2026-07-11T00:00:00.000Z
 * - month: "2026-08" -> 2026-08-01T00:00:00.000Z
 * - year: "2027" -> 2027-01-01T00:00:00.000Z
 */
export function parseAndNormalizeCmsDate(
  value?: string | null,
  precision?: DatePrecision | null
): NormalizedDateResult {
  if (!value || !value.trim() || !precision) {
    return { date: null, precision: null };
  }

  const trimmed = value.trim();

  if (precision === "day") {
    // Matches YYYY-MM-DD
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return { date: null, precision: null };
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(date.getTime())) return { date: null, precision: null };
    return { date, precision: "day" };
  }

  if (precision === "month") {
    // Matches YYYY-MM or YYYY-MM-DD
    const match = trimmed.match(/^(\d{4})-(\d{2})/);
    if (!match) return { date: null, precision: null };
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const date = new Date(Date.UTC(year, month - 1, 1));
    if (isNaN(date.getTime())) return { date: null, precision: null };
    return { date, precision: "month" };
  }

  if (precision === "year") {
    // Matches YYYY
    const match = trimmed.match(/^(\d{4})/);
    if (!match) return { date: null, precision: null };
    const year = parseInt(match[1], 10);
    const date = new Date(Date.UTC(year, 0, 1));
    if (isNaN(date.getTime())) return { date: null, precision: null };
    return { date, precision: "year" };
  }

  return { date: null, precision: null };
}

/**
 * Converts a carrier Date and DatePrecision into a string suitable for HTML form input values.
 * - day -> "YYYY-MM-DD"
 * - month -> "YYYY-MM"
 * - year -> "YYYY"
 */
export function toCmsDateInputValue(
  dateInput?: Date | string | null,
  precision?: DatePrecision | null
): string {
  if (!dateInput || !precision) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");

  switch (precision) {
    case "day":
      return `${yyyy}-${mm}-${dd}`;
    case "month":
      return `${yyyy}-${mm}`;
    case "year":
      return `${yyyy}`;
    default:
      return "";
  }
}

/**
 * Ensures endDate >= startDate when both dates are present.
 */
export function validateDateRange(startDate?: Date | null, endDate?: Date | null): boolean {
  if (!startDate || !endDate) return true;
  return endDate.getTime() >= startDate.getTime();
}
