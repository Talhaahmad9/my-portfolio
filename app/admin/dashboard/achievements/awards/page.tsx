import { connectDB } from "@/lib/db/mongo";
import { getCanonicalAwards } from "@/lib/admin/queries/achievements";
import { getCanonicalSkills } from "@/lib/admin/queries/skills";
import { ProjectModel, IProject } from "@/lib/db/models/Project";
import { EventModel, IEvent } from "@/lib/db/models/Event";
import { AwardManagement } from "@/components/admin/cms/AwardManagement";

export default async function AdminAwardsPage() {
  await connectDB();

  const [{ awards }, skills, projectDocs, eventDocs] = await Promise.all([
    getCanonicalAwards(),
    getCanonicalSkills(),
    ProjectModel.find().select("title publicationStatus").lean<IProject[]>(),
    EventModel.find().select("title publicationStatus").lean<IEvent[]>(),
  ]);

  const allProjects = projectDocs.map((p) => ({
    id: String(p._id),
    title: p.title,
    isArchived: p.publicationStatus === "archived",
  }));

  const allEvents = eventDocs.map((e) => ({
    id: String(e._id),
    title: e.title,
    isArchived: e.publicationStatus === "archived",
  }));

  const allSkills = skills.map((s) => ({
    id: s._id,
    name: s.name,
    isArchived: s.publicationStatus === "archived",
  }));

  return (
    <div className="space-y-6">
      <AwardManagement
        initialAwards={awards}
        allProjects={allProjects}
        allEvents={allEvents}
        allSkills={allSkills}
      />
    </div>
  );
}
