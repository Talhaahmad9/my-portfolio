import { getCanonicalEducation } from "@/lib/admin/queries/education";
import { EducationManagement } from "@/components/admin/cms/EducationManagement";
import { GraduationCap } from "lucide-react";

export default async function AdminEducationPage() {
  const education = await getCanonicalEducation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-orangeWeb">
            <GraduationCap className="h-4 w-4" />
            Academic Credentials
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold text-white">Education</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Canonical university degrees, academic programs, and educational institution records. ({education.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
            CRUD Active
          </span>
        </div>
      </div>

      {/* Interactive Management Surface */}
      <EducationManagement initialEducation={education} />
    </div>
  );
}
