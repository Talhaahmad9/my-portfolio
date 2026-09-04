import { connectDB } from "@/lib/db/mongo";
import { getCanonicalEvents } from "@/lib/admin/queries/events";
import { getCanonicalRoles } from "@/lib/admin/queries/roles";
import { getCanonicalSkills } from "@/lib/admin/queries/skills";
import { ProjectModel, IProject } from "@/lib/db/models/Project";
import { EventManagement } from "@/components/admin/cms/EventManagement";

export default async function AdminEventsPage() {
  await connectDB();

  const [{ events }, { roles }, skills, projectDocs] = await Promise.all([
    getCanonicalEvents(),
    getCanonicalRoles(),
    getCanonicalSkills(),
    ProjectModel.find().select("title publicationStatus").lean<IProject[]>(),
  ]);

  const allProjects = projectDocs.map((p) => ({
    id: String(p._id),
    title: p.title,
    isArchived: p.publicationStatus === "archived",
  }));

  const allRoles = roles.map((r) => ({
    id: r._id,
    roleTitle: r.roleTitle,
    organization: r.organization,
    isArchived: r.publicationStatus === "archived",
  }));

  const allSkills = skills.map((s) => ({
    id: s._id,
    name: s.name,
    isArchived: s.publicationStatus === "archived",
  }));

  return (
    <div className="space-y-6">
      <EventManagement
        initialEvents={events}
        allProjects={allProjects}
        allRoles={allRoles}
        allSkills={allSkills}
      />
    </div>
  );
}
