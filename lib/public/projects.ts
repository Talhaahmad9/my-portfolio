import { connectDB } from "@/lib/db/mongo";
import { ProjectModel, IProject } from "@/lib/db/models/Project";
import { SkillModel, ISkill } from "@/lib/db/models/Skill";
import { Types } from "mongoose";

export interface PublicProject {
  id: string;
  title: string;
  slug?: string;
  caseStudyUrl?: string;
  hasCaseStudy: boolean;

  description: string;
  technologies: string[];

  imageUrl?: string;
  images: string[];
  imageFit?: "cover" | "contain";

  liveUrl?: string;
  githubUrl?: string;

  badge?: string;

  featured: boolean;
  displayOrder: number;
}

/**
 * Shared readiness check for Project case studies.
 */
export function isProjectCaseStudyReady(project?: Partial<IProject> | null): boolean {
  if (!project) return false;
  if (project.publicationStatus !== "published") return false;
  if (!project.slug || !project.slug.trim()) return false;

  const shortDesc = project.shortDescription;
  if (!shortDesc || !shortDesc.trim()) return false;

  const substantiveAreas = [
    Boolean(project.longDescription && project.longDescription.trim()),
    Boolean(project.architectureOverview && project.architectureOverview.trim()),
    Boolean(project.technicalDecisions && project.technicalDecisions.length > 0),
    Boolean(project.challenges && project.challenges.length > 0),
    Boolean(project.outcomes && project.outcomes.length > 0),
    Boolean(project.metrics && project.metrics.length > 0),
    Boolean(project.architectureDiagramUrl && project.architectureDiagramUrl.trim()),
    Boolean(project.galleryUrls && project.galleryUrls.length > 0),
  ].filter(Boolean).length;

  return substantiveAreas >= 2;
}

/**
 * Server-side helper to fetch canonical-first published Projects for the public site.
 */
export async function getPublishedProjectsForPublic(): Promise<PublicProject[]> {
  await connectDB();

  const projectDocs = await ProjectModel.find({ publicationStatus: "published" })
    .lean() as unknown as (IProject & { _id: Types.ObjectId })[];

  // Collect all referenced skillIds for batch resolution
  const skillIdSet = new Set<string>();
  for (const proj of projectDocs) {
    if (proj.skillIds && proj.skillIds.length > 0) {
      for (const sid of proj.skillIds) {
        const sStr = sid.toString();
        if (sStr) skillIdSet.add(sStr);
      }
    }
  }

  const skillDocs = skillIdSet.size > 0
    ? await SkillModel.find({ _id: { $in: Array.from(skillIdSet) } }).lean() as unknown as (ISkill & { _id: Types.ObjectId })[]
    : [];

  const skillMap = new Map<string, string>();
  for (const sk of skillDocs) {
    skillMap.set(sk._id.toString(), sk.name);
  }

  const publicProjects: PublicProject[] = projectDocs.map((doc) => {
    const description = doc.shortDescription || "";

    let technologies: string[] = [];
    if (doc.skillIds && doc.skillIds.length > 0) {
      technologies = doc.skillIds
        .map((sid) => skillMap.get(sid.toString()))
        .filter((name): name is string => Boolean(name));
    }

    const imageUrl = doc.thumbnailUrl || undefined;
    // Intentionally retaining doc.images fallback for project carousel backward compatibility if needed
    const images = doc.images && doc.images.length > 0
      ? doc.images
      : (doc.thumbnailUrl ? [doc.thumbnailUrl] : []);

    const featured = Boolean(doc.isFeatured);
    const displayOrder = doc.displayOrder ?? 0;
    const liveUrl = doc.demoUrl || undefined;

    const hasCaseStudy = isProjectCaseStudyReady(doc);
    const caseStudyUrl = hasCaseStudy && doc.slug ? `/projects/${doc.slug}` : undefined;

    return {
      id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug || undefined,
      caseStudyUrl,
      hasCaseStudy,
      description,
      technologies,
      imageUrl,
      images,
      imageFit: (doc.imageFit as "cover" | "contain") || "contain",
      liveUrl,
      githubUrl: doc.githubUrl || undefined,
      badge: doc.badge || undefined,
      featured,
      displayOrder,
    };
  });

  // Sort by displayOrder ascending, then createdAt ascending
  publicProjects.sort((a, b) => a.displayOrder - b.displayOrder);

  return publicProjects;
}
