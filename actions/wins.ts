"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { IWin, WinModel } from "@/lib/db/models/Win";
import { auth } from "@/lib/auth";
import { decodeLegacyEscapedContent, sanitizeObject } from "@/lib/sanitize";
import { winSchema } from "@/lib/validate";

interface ActionResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}

function toPlainWin<T>(value: T): T {
  return decodeLegacyEscapedContent(JSON.parse(JSON.stringify(value)) as T);
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function getWins(): Promise<IWin[]> {
  const wins = await WinModel.find({}).sort({ date: -1 }).lean();
  return toPlainWin(wins);
}

export async function createWin(data: unknown): Promise<ActionResult<IWin>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = winSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid win data",
    };
  }

  try {
    const sanitized = sanitizeObject(parsed.data);

    const payload = {
      ...sanitized,
      score: normalizeOptionalString(sanitized.score),
      description: normalizeOptionalString(sanitized.description),
      stack: sanitized.stack?.map((item) => item.trim()).filter((item) => item.length > 0),
    };

    const created = await WinModel.create(payload);

    revalidatePath("/admin/dashboard/wins");
    revalidatePath("/");

    return {
      success: true,
      data: toPlainWin(created.toObject()) as IWin,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create win";
    return { success: false, error: message };
  }
}

export async function deleteWin(id: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: "Invalid win id" };
  }

  try {
    const deleted = await WinModel.findByIdAndDelete(parsedId.data).lean();
    if (!deleted) {
      return { success: false, error: "Win not found" };
    }

    revalidatePath("/admin/dashboard/wins");
    revalidatePath("/");

    return { success: true, data: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete win";
    return { success: false, error: message };
  }
}
