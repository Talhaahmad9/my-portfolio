import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import { getCanonicalRoles } from "@/lib/admin/queries/roles";
import { getCanonicalEducation } from "@/lib/admin/queries/education";

export default async function ExperiencePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin");
  }

  const [{ roles }, education] = await Promise.all([
    getCanonicalRoles(),
    getCanonicalEducation(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-black/30 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orangeWeb/30 bg-orangeWeb/10 text-orangeWeb">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-orangeWeb">Experience Domain</p>
            <h1 className="font-heading text-2xl font-semibold text-white">Experience & History</h1>
          </div>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-platinum/80">
          Management hub for canonical Roles (Professional, Leadership, Community) and Academic Education history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-oxfordBlue bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orangeWeb">
                <Briefcase className="h-5 w-5" />
                <h2 className="font-heading text-lg font-medium text-white">Roles</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orangeWeb/10 text-orangeWeb border border-orangeWeb/20">
                {roles.length} records
              </span>
            </div>
            <p className="mt-2 text-xs text-platinum/70 leading-relaxed">
              Manage professional positions, organizational leadership, and community roles.
            </p>
          </div>
          <Link
            href="/admin/dashboard/experience/roles"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orangeWeb hover:underline"
          >
            View Roles ({roles.length}) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-xl border border-oxfordBlue bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orangeWeb">
                <GraduationCap className="h-5 w-5" />
                <h2 className="font-heading text-lg font-medium text-white">Education</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orangeWeb/10 text-orangeWeb border border-orangeWeb/20">
                {education.length} records
              </span>
            </div>
            <p className="mt-2 text-xs text-platinum/70 leading-relaxed">
              Manage education, academic credentials, and institutional history.
            </p>
          </div>
          <Link
            href="/admin/dashboard/experience/education"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orangeWeb hover:underline"
          >
            View Education ({education.length}) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
