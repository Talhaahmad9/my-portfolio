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

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${R2_PUBLIC_BASE_URL}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export function extractR2Key(url: string): string {
  const normalizedBase = `${R2_PUBLIC_BASE_URL}/`;
  if (url.startsWith(normalizedBase)) {
    return url.slice(normalizedBase.length);
  }

  const maybePath = new URL(url).pathname;
  return maybePath.replace(/^\//, "");
}
