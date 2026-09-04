import { Types } from "mongoose";
import {
  AwardType,
  DatePrecision,
  EventType,
  PublicationStatus,
  RoleCategory,
} from "@/lib/cms/types";

export const PUBLICATION_STATUSES: PublicationStatus[] = ["draft", "published", "archived"];
export const DATE_PRECISIONS: DatePrecision[] = ["day", "month", "year"];
export const ROLE_CATEGORIES: RoleCategory[] = ["professional", "freelance", "leadership", "community"];
export const EVENT_TYPES: EventType[] = [
  "hackathon",
  "competition",
  "workshop",
  "webinar",
  "conference",
  "community",
  "other",
];
export const AWARD_TYPES: AwardType[] = ["competition", "recognition", "academic", "other"];

/**
 * Validates whether a string or unknown input is a valid 24-character hex MongoDB ObjectId.
 */
export function isValidObjectId(id: unknown): boolean {
  if (typeof id !== "string" && !(id instanceof Types.ObjectId)) {
    return false;
  }
  return Types.ObjectId.isValid(String(id));
}

/**
 * Validates, deduplicates, and converts an array of string/ObjectId inputs into Mongoose Types.ObjectId[].
 * Throws an Error if any element is not a valid ObjectId format.
 */
export function normalizeObjectIdArray(input: unknown): Types.ObjectId[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const uniqueStringIds = Array.from(
    new Set(
      input
        .map((item) => (typeof item === "string" ? item.trim() : String(item)))
        .filter(Boolean)
    )
  );

  for (const idStr of uniqueStringIds) {
    if (!Types.ObjectId.isValid(idStr)) {
      throw new Error(`Invalid ObjectId format: "${idStr}"`);
    }
  }

  return uniqueStringIds.map((idStr) => new Types.ObjectId(idStr));
}
