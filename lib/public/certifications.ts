import { connectDB } from "@/lib/db/mongo";
import { CertificationModel, ICertificationEntity } from "@/lib/db/models/Certification";
import { Types } from "mongoose";

export interface PublicCertification {
  id: string;
  name: string;
  issuer: string;
  publicId: string;
  mediaUrl: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

export async function getPublishedCertificationsForPublic(): Promise<PublicCertification[]> {
  await connectDB();

  const docs = (await CertificationModel.find({
    publicationStatus: "published",
  })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean()) as unknown as (ICertificationEntity & { _id: Types.ObjectId })[];

  return docs
    .filter((doc) => Boolean(doc.publicId?.trim()) && Boolean(doc.mediaUrl?.trim()))
    .map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      issuer: doc.issuer,
      publicId: doc.publicId!.trim(),
      mediaUrl: doc.mediaUrl!.trim(),
      issueDate: doc.issueDate || undefined,
      expiryDate: doc.expiryDate || undefined,
      credentialId: doc.credentialId || undefined,
      credentialUrl: doc.credentialUrl || undefined,
      description: doc.description || undefined,
    }));
}

export async function getPublishedCertificateByPublicId(
  publicId: string
): Promise<PublicCertification | null> {
  if (!publicId || !publicId.trim()) {
    return null;
  }

  await connectDB();

  const doc = (await CertificationModel.findOne({
    publicId: publicId.trim(),
    publicationStatus: "published",
  }).lean()) as unknown as (ICertificationEntity & { _id: Types.ObjectId }) | null;

  if (!doc || !doc.publicId?.trim() || !doc.mediaUrl?.trim()) {
    return null;
  }

  return {
    id: doc._id.toString(),
    name: doc.name,
    issuer: doc.issuer,
    publicId: doc.publicId.trim(),
    mediaUrl: doc.mediaUrl.trim(),
    issueDate: doc.issueDate || undefined,
    expiryDate: doc.expiryDate || undefined,
    credentialId: doc.credentialId || undefined,
    credentialUrl: doc.credentialUrl || undefined,
    description: doc.description || undefined,
  };
}
