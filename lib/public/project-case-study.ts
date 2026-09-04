import { connectDB } from "@/lib/db/mongo";
import { ProjectModel, IProject, ITechnicalDecision, ITechnicalChallenge, IMetric } from "@/lib/db/models/Project";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { RoleModel, IRole } from "@/lib/db/models/Role";
import { isProjectCaseStudyReady } from "@/lib/public/projects";
import { getCanonicalSiteSeo } from "@/lib/public/site-settings";
import { Types } from "mongoose";

export interface PublicCaseStudyViewModel {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  shortDescription: string;
  longDescription?: string;
  category?: string;
  projectType?: string;
  
  thumbnailUrl?: string;
  bannerUrl?: string;
  architectureDiagramUrl?: string;
  galleryUrls: string[];

  skills: { id: string; name: string; category?: string }[];
  roles: { id: string; roleTitle: string; organization: string }[];

  architectureOverview?: string;
  technicalDecisions: ITechnicalDecision[];
  challenges: ITechnicalChallenge[];
  outcomes: string[];
  metrics: IMetric[];

  demoUrl?: string;
  documentationUrl?: string;
  githubUrl?: string;

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    noIndex: boolean;
    ogImageUrl?: string;
  };
}

export async function getPublicCaseStudyBySlug(slug: string): Promise<PublicCaseStudyViewModel | null> {
  if (!slug || !slug.trim()) return null;

  await connectDB();

  const doc = (await ProjectModel.findOne({
    slug: slug.trim().toLowerCase(),
    publicationStatus: "published",
  }).lean()) as unknown as (IProject & { _id: Types.ObjectId }) | null;

  if (!doc) return null;

  // Enforce the shared readiness check
  if (!isProjectCaseStudyReady(doc)) return null;

  // Batch resolve Skill models
  let skills: { id: string; name: string; category?: string }[] = [];
  if (doc.skillIds && doc.skillIds.length > 0) {
    const skillDocs = (await SkillModel.find({
      _id: { $in: doc.skillIds },
    }).lean()) as unknown as (ISkill & { _id: Types.ObjectId })[];

    skills = skillDocs.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      category: s.category,
    }));
  }

  // Batch resolve Role models
  let roles: { id: string; roleTitle: string; organization: string }[] = [];
  if (doc.roleIds && doc.roleIds.length > 0) {
    const roleDocs = (await RoleModel.find({
      _id: { $in: doc.roleIds },
    }).lean()) as unknown as (IRole & { _id: Types.ObjectId })[];

    roles = roleDocs.map((r) => ({
      id: r._id.toString(),
      roleTitle: r.roleTitle,
      organization: r.organization,
    }));
  }

  const siteSeo = await getCanonicalSiteSeo();

  const shortDesc = doc.shortDescription || "";
  const metaTitle = doc.seo?.metaTitle || `${doc.title} — Case Study | Talha Ahmad`;
  const metaDescription = doc.seo?.metaDescription || shortDesc;
  const keywords = doc.seo?.keywords || [];
  const ogImageUrl = doc.bannerUrl || doc.thumbnailUrl || (doc.images && doc.images[0]) || undefined;

  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug || slug,
    tagline: doc.tagline || undefined,
    shortDescription: shortDesc,
    longDescription: doc.longDescription || undefined,
    category: doc.category || undefined,
    projectType: doc.projectType || undefined,
    thumbnailUrl: doc.thumbnailUrl || (doc.images && doc.images[0]) || undefined,
    bannerUrl: doc.bannerUrl || undefined,
    architectureDiagramUrl: doc.architectureDiagramUrl || undefined,
    galleryUrls: doc.galleryUrls || [],
    skills,
    roles,
    architectureOverview: doc.architectureOverview || undefined,
    technicalDecisions: doc.technicalDecisions || [],
    challenges: doc.challenges || [],
    outcomes: doc.outcomes || [],
    metrics: doc.metrics || [],
    demoUrl: doc.demoUrl || undefined,
    documentationUrl: doc.documentationUrl || undefined,
    githubUrl: doc.githubUrl || undefined,
    seo: {
      metaTitle,
      metaDescription,
      keywords,
      noIndex: siteSeo.noIndex,
      ogImageUrl,
    },
  };
}
