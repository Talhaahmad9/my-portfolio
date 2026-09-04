import { connectDB } from "@/lib/db/mongo";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { Types } from "mongoose";

export interface PublicSkill {
  id: string;
  name: string;
  slug: string;
  category: string;
  summary?: string;
  featured: boolean;
  displayOrder: number;
}

export interface PublicSkillGroup {
  category: string;
  items: string[];
  skills: PublicSkill[];
}

/**
 * Fetches all published canonical skills sorted by displayOrder.
 */
export async function getPublishedSkillsForPublic(): Promise<PublicSkill[]> {
  await connectDB();

  const docs = (await SkillModel.find({
    publicationStatus: "published",
  })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean()) as unknown as (ISkill & { _id: Types.ObjectId })[];

  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    summary: doc.summary || undefined,
    featured: doc.featured ?? false,
    displayOrder: doc.displayOrder ?? 0,
  }));
}

/**
 * Fetches published skills grouped by category in category order,
 * formatted for presentation in AboutSection.
 */
export async function getPublishedSkillGroupsForPublic(): Promise<PublicSkillGroup[]> {
  const skills = await getPublishedSkillsForPublic();

  const groupMap = new Map<string, PublicSkill[]>();

  for (const skill of skills) {
    const existing = groupMap.get(skill.category) || [];
    existing.push(skill);
    groupMap.set(skill.category, existing);
  }

  const groups: PublicSkillGroup[] = [];
  for (const [category, categorySkills] of groupMap.entries()) {
    groups.push({
      category,
      items: categorySkills.map((s) => s.name),
      skills: categorySkills,
    });
  }

  return groups;
}
