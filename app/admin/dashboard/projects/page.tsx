import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjects } from "@/actions/projects";
import { getCanonicalSkills } from "@/lib/admin/queries/skills";
import { getCanonicalRoles } from "@/lib/admin/queries/roles";
import ProjectsTab from "@/components/admin/ProjectsTab";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin");
  }

  const [projects, skills, rolesRes] = await Promise.all([
    getProjects(),
    getCanonicalSkills(),
    getCanonicalRoles(),
  ]);

  const allSkills = skills.map((s) => ({
    id: s._id,
    name: s.name,
    isArchived: s.publicationStatus === "archived",
  }));

  const allRoles = rolesRes.roles.map((r) => ({
    id: r._id,
    roleTitle: r.roleTitle,
    organization: r.organization,
    isArchived: r.publicationStatus === "archived",
  }));

  return <ProjectsTab projects={projects} allSkills={allSkills} allRoles={allRoles} />;
}
