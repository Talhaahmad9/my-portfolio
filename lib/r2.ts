import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. Please define it in .env.local.`);
  }
  return value;
}

const R2_ACCOUNT_ID = requireEnv("CLOUDFLARE_R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = requireEnv("CLOUDFLARE_R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = requireEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
const R2_BUCKET_NAME = requireEnv("CLOUDFLARE_R2_BUCKET_NAME");
const R2_PUBLIC_BASE_URL = requireEnv("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface R2UploadResult {
  key: string;
  url: string;
}

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<R2UploadResult> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: `${R2_PUBLIC_BASE_URL}/${key}`,
  };
}

export async function deleteFromR2(key: string): Promise<void> {
  if (!key || typeof key !== "string" || key.trim() === "") {
    return;
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key.trim(),
    })
  );
}

export function extractR2Key(urlOrKey: string): string {
  if (!urlOrKey || typeof urlOrKey !== "string") {
    return "";
  }

  const trimmed = urlOrKey.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsedUrl = new URL(trimmed);
      const configuredBaseUrl = new URL(R2_PUBLIC_BASE_URL);

      if (parsedUrl.origin.toLowerCase() !== configuredBaseUrl.origin.toLowerCase()) {
        console.warn(`[R2 Security Warning] Skipped deletion for foreign URL: "${trimmed}"`);
        return "";
      }

      const basePath = configuredBaseUrl.pathname.replace(/\/$/, "");
      let extractedPath = parsedUrl.pathname;
      if (basePath && extractedPath.startsWith(basePath)) {
        extractedPath = extractedPath.slice(basePath.length);
      }

      return extractedPath.replace(/^\/+/, "");
    } catch {
      console.warn(`[R2 Security Warning] Skipped deletion for malformed URL: "${trimmed}"`);
      return "";
    }
  }

  const cleanKey = trimmed.replace(/^\/+/, "");
  if (cleanKey === "" || cleanKey === "." || cleanKey.includes("..")) {
    return "";
  }

  return cleanKey;
}

export async function deleteFromR2Safely(keyOrUrl: string): Promise<void> {
  const key = extractR2Key(keyOrUrl);
  if (!key) return;

  try {
    await deleteFromR2(key);
  } catch (error) {
    console.error(`[R2 Storage Warning] Failed to delete object key "${key}":`, error);
  }
}

export async function rollbackR2Uploads(keysOrUrls: string[]): Promise<void> {
  if (!Array.isArray(keysOrUrls) || keysOrUrls.length === 0) return;

  await Promise.allSettled(
    keysOrUrls.map((item) => deleteFromR2Safely(item))
  );
}

export async function cleanupObsoleteR2Objects(keysOrUrls: string[]): Promise<void> {
  if (!Array.isArray(keysOrUrls) || keysOrUrls.length === 0) return;

  await Promise.allSettled(
    keysOrUrls.map((item) => deleteFromR2Safely(item))
  );
}
