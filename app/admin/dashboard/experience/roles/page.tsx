import { getCanonicalRoles } from "@/lib/admin/queries/roles";
import { getCanonicalSkills } from "@/lib/admin/queries/skills";
import { RoleManagement } from "@/components/admin/cms/RoleManagement";
import { Briefcase, AlertCircle } from "lucide-react";

export default async function AdminRolesPage() {
  const { roles, unresolvedSkillRefs } = await getCanonicalRoles();
  const skills = await getCanonicalSkills();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-orangeWeb">
            <Briefcase className="h-4 w-4" />
            Career & Positions
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold text-white">Roles</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Canonical professional positions, founder tenures, and organizational leadership roles. ({roles.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
            CRUD Active
          </span>
        </div>
      </div>

      {/* Unresolved References Warning */}
      {unresolvedSkillRefs > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>Found {unresolvedSkillRefs} unresolved skill reference(s) across roles.</span>
        </div>
      )}

      {/* Interactive Management Surface */}
      <RoleManagement initialRoles={roles} allSkills={skills} />
    </div>
  );
}
