import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjects } from "@/actions/projects";
import ProjectsTab from "@/components/admin/ProjectsTab";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin");
  }

  const projects = await getProjects();

  return <ProjectsTab projects={projects} />;
}
