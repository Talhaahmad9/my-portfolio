import { DatePrecision } from "@/lib/cms/types";

/**
 * Server-safe UTC date formatter for canonical CMS records.
 * Respects precision level ("day" | "month" | "year").
 * Prevents timezone shifting by using UTC methods.
 */
export function formatCmsDate(
  dateInput?: Date | string | null,
  precision?: DatePrecision | null
): string | null {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = date.getUTCDate();
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  switch (precision) {
    case "day":
      return `${day} ${month} ${year}`;
    case "month":
      return `${month} ${year}`;
    case "year":
      return `${year}`;
    default:
      // Default fallback if precision is omitted (e.g. Award exact day)
      return `${day} ${month} ${year}`;
  }
}

export interface CmsDateRangeResult {
  formatted: string;
  hasStartDate: boolean;
  hasEndDate: boolean;
}

/**
 * Formats start and end dates with precision metadata into a human-readable range string.
 * Handles current roles, missing start dates, and year-only education dates cleanly.
 */
export function formatCmsDateRange(
  startInput?: Date | string | null,
  startPrec?: DatePrecision | null,
  endInput?: Date | string | null,
  endPrec?: DatePrecision | null,
  isCurrent?: boolean
): CmsDateRangeResult {
  const formattedStart = formatCmsDate(startInput, startPrec);
  const formattedEnd = formatCmsDate(endInput, endPrec);

  const hasStartDate = Boolean(formattedStart);
  const hasEndDate = Boolean(formattedEnd);

  let formatted = "";

  if (hasStartDate && hasEndDate) {
    formatted = `${formattedStart} — ${formattedEnd}`;
  } else if (hasStartDate && isCurrent) {
    formatted = `${formattedStart} — Present`;
  } else if (hasStartDate && !hasEndDate) {
    formatted = `${formattedStart}`;
  } else if (!hasStartDate && hasEndDate) {
    if (isCurrent) {
      formatted = `Expected ${formattedEnd}`;
    } else {
      formatted = `Ended ${formattedEnd}`;
    }
  } else if (!hasStartDate && isCurrent) {
    formatted = "Present";
  } else {
    formatted = "Date range unspecified";
  }

  return {
    formatted,
    hasStartDate,
    hasEndDate,
  };
}
