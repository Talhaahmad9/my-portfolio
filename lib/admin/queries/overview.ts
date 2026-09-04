import { connectDB } from "@/lib/db/mongo";
import { ProjectModel } from "@/lib/db/models/Project";
import { SkillModel } from "@/lib/db/models/Skill";
import { RoleModel } from "@/lib/db/models/Role";
import { EducationModel } from "@/lib/db/models/Education";
import { EventModel } from "@/lib/db/models/Event";
import { AwardModel } from "@/lib/db/models/Award";
import { CertificationModel } from "@/lib/db/models/Certification";
import { ResumeModel } from "@/lib/db/models/Resume";

export interface CmsOverviewStats {
  projects: { total: number; published: number; draft: number; archived: number };
  skills: { total: number; published: number; draft: number; archived: number };
  roles: { total: number; published: number; draft: number; archived: number };
  education: { total: number; published: number; draft: number; archived: number };
  events: { total: number; published: number; draft: number; archived: number };
  awards: { total: number; published: number; draft: number; archived: number };
  certifications: { total: number; published: number; draft: number; archived: number };
  resumes: { total: number; active: number };
}

export async function getOverviewStats(): Promise<CmsOverviewStats> {
  await connectDB();

  const [
    projectsTotal,
    projectsPublished,
    skillsTotal,
    skillsPublished,
    rolesTotal,
    rolesPublished,
    educationTotal,
    educationPublished,
    eventsTotal,
    eventsPublished,
    awardsTotal,
    awardsPublished,
    certificationsTotal,
    certificationsPublished,
    resumesTotal,
    resumesActive,
  ] = await Promise.all([
    ProjectModel.countDocuments(),
    ProjectModel.countDocuments({ publicationStatus: "published" }),
    SkillModel.countDocuments(),
    SkillModel.countDocuments({ publicationStatus: "published" }),
    RoleModel.countDocuments(),
    RoleModel.countDocuments({ publicationStatus: "published" }),
    EducationModel.countDocuments(),
    EducationModel.countDocuments({ publicationStatus: "published" }),
    EventModel.countDocuments(),
    EventModel.countDocuments({ publicationStatus: "published" }),
    AwardModel.countDocuments(),
    AwardModel.countDocuments({ publicationStatus: "published" }),
    CertificationModel.countDocuments(),
    CertificationModel.countDocuments({ publicationStatus: "published" }),
    ResumeModel.countDocuments(),
    ResumeModel.countDocuments({ isActive: true }),
  ]);

  return {
    projects: {
      total: projectsTotal,
      published: projectsPublished,
      draft: projectsTotal - projectsPublished,
      archived: 0,
    },
    skills: {
      total: skillsTotal,
      published: skillsPublished,
      draft: skillsTotal - skillsPublished,
      archived: 0,
    },
    roles: {
      total: rolesTotal,
      published: rolesPublished,
      draft: rolesTotal - rolesPublished,
      archived: 0,
    },
    education: {
      total: educationTotal,
      published: educationPublished,
      draft: educationTotal - educationPublished,
      archived: 0,
    },
    events: {
      total: eventsTotal,
      published: eventsPublished,
      draft: eventsTotal - eventsPublished,
      archived: 0,
    },
    awards: {
      total: awardsTotal,
      published: awardsPublished,
      draft: awardsTotal - awardsPublished,
      archived: 0,
    },
    certifications: {
      total: certificationsTotal,
      published: certificationsPublished,
      draft: certificationsTotal - certificationsPublished,
      archived: 0,
    },
    resumes: {
      total: resumesTotal,
      active: resumesActive,
    },
  };
}
