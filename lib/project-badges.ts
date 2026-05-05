const PROJECT_BADGE_EMOJI_REGEX =
  /[\p{Extended_Pictographic}\p{Emoji_Presentation}\u200D\uFE0F]/gu;

export function normalizeProjectBadgeLabel(
  value: string | null | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value
    .replace(PROJECT_BADGE_EMOJI_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.length > 0 ? normalized : undefined;
}