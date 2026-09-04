import { getCanonicalSkills } from "@/lib/admin/queries/skills";
import { SkillManagement } from "@/components/admin/cms/SkillManagement";
import { Code2 } from "lucide-react";

export default async function AdminSkillsPage() {
  const skills = await getCanonicalSkills();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-orangeWeb">
            <Code2 className="h-4 w-4" />
            Taxonomy & Competencies
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold text-white">Skills</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Canonical skill inventory powering portfolio project tags and domain relationships. ({skills.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
            Canonical CRUD Active
          </span>
        </div>
      </div>

      {/* Interactive Skill Management */}
      <SkillManagement initialSkills={skills} />
    </div>
  );
}
