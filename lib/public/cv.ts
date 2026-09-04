import {
  getCanonicalSiteSettings,
  getCanonicalSiteSeo,
  PublicSiteContent,
  PublicSiteSeo,
} from "@/lib/public/site-settings";
import {
  getPublicExperienceForPublic,
  PublicExperienceData,
} from "@/lib/public/experience";
import {
  getPublishedSkillGroupsForPublic,
  PublicSkillGroup,
} from "@/lib/public/skills";
import {
  getPublishedProjectsForPublic,
  PublicProject,
} from "@/lib/public/projects";
import {
  getPublishedAwardsForPublic,
  PublicAward,
} from "@/lib/public/awards";
import {
  getPublishedCertificationsForPublic,
  PublicCertification,
} from "@/lib/public/certifications";
import { getActiveResume } from "@/actions/resume";

export interface PublicCvData {
  siteContent: PublicSiteContent;
  seo: PublicSiteSeo;
  experience: PublicExperienceData;
  skillGroups: PublicSkillGroup[];
  selectedProjects: PublicProject[];
  awards: PublicAward[];
  certifications: PublicCertification[];
  resume: {
    fileUrl: string | null;
    label: string | null;
  } | null;
}

/**
 * Server-side helper to assemble all canonical data for the interactive /cv page.
 */
export async function getCvData(): Promise<PublicCvData> {
  const [
    siteContent,
    seo,
    experience,
    skillGroups,
    allProjects,
    awards,
    certifications,
    activeResume,
  ] = await Promise.all([
    getCanonicalSiteSettings(),
    getCanonicalSiteSeo(),
    getPublicExperienceForPublic(),
    getPublishedSkillGroupsForPublic(),
    getPublishedProjectsForPublic(),
    getPublishedAwardsForPublic(),
    getPublishedCertificationsForPublic(),
    getActiveResume(),
  ]);

  // Selected projects rule: prefer featured projects, fallback to top projects by displayOrder up to 4 total
  const featured = allProjects.filter((p) => p.featured);
  let selectedProjects = featured.length >= 3 ? featured : allProjects;
  if (selectedProjects.length > 4) {
    selectedProjects = selectedProjects.slice(0, 4);
  }

  return {
    siteContent,
    seo,
    experience,
    skillGroups,
    selectedProjects,
    awards,
    certifications,
    resume: activeResume
      ? {
          fileUrl: activeResume.fileUrl ?? null,
          label: activeResume.label ?? null,
        }
      : null,
  };
}
