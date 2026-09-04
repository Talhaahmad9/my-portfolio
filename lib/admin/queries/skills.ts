import { connectDB } from "@/lib/db/mongo";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { PublicationStatus } from "@/lib/cms/types";

export interface PlainSkill {
  _id: string;
  name: string;
  slug: string;
  category: string;
  summary?: string;
  featured?: boolean;
  displayOrder: number;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export async function getCanonicalSkills(): Promise<PlainSkill[]> {
  await connectDB();

  const docs = await SkillModel.find()
    .sort({ displayOrder: 1, name: 1 })
    .lean<ISkill[]>();

  return docs.map((doc) => ({
    _id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    summary: doc.summary,
    featured: doc.featured ?? false,
    displayOrder: doc.displayOrder ?? 0,
    publicationStatus: doc.publicationStatus,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
  }));
}
