import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Calendar,
  Code2,
  FileText,
  FolderKanban,
  LayoutPanelLeft,
  Search,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { getOverviewStats } from "@/lib/admin/queries/overview";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin");
  }

  const stats = await getOverviewStats();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-black/30 pb-6">
        <p className="font-heading text-xs uppercase tracking-[0.25em] text-orangeWeb">
          Portfolio CMS
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-white">
          System Overview & Architecture
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-platinum/80">
          Manage structured content, professional history, projects, achievements, skills, and site assets. Dynamic database counts reflect live MongoDB collections.
        </p>
      </div>

      {/* Dynamic Summary Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/40 p-4">
          <div className="flex items-center justify-between text-platinum/60">
            <span className="text-xs font-medium uppercase tracking-wider">Projects</span>
            <FolderKanban className="h-4 w-4 text-orangeWeb" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{stats.projects.total}</p>
          <p className="text-[11px] text-platinum/60 mt-0.5">
            {stats.projects.published} published
          </p>
        </div>

        <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/40 p-4">
          <div className="flex items-center justify-between text-platinum/60">
            <span className="text-xs font-medium uppercase tracking-wider">Skills</span>
            <Code2 className="h-4 w-4 text-orangeWeb" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{stats.skills.total}</p>
          <p className="text-[11px] text-platinum/60 mt-0.5">
            {stats.skills.published} published
          </p>
        </div>

        <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/40 p-4">
          <div className="flex items-center justify-between text-platinum/60">
            <span className="text-xs font-medium uppercase tracking-wider">Experience</span>
            <Briefcase className="h-4 w-4 text-orangeWeb" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {stats.roles.total + stats.education.total}
          </p>
          <p className="text-[11px] text-platinum/60 mt-0.5">
            {stats.roles.total} roles, {stats.education.total} education
          </p>
        </div>

        <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/40 p-4">
          <div className="flex items-center justify-between text-platinum/60">
            <span className="text-xs font-medium uppercase tracking-wider">Events & Wins</span>
            <Calendar className="h-4 w-4 text-orangeWeb" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {stats.events.total + stats.awards.total + stats.certifications.total}
          </p>
          <p className="text-[11px] text-platinum/60 mt-0.5">
            {stats.events.total} events, {stats.awards.total} awards, {stats.certifications.total} certs
          </p>
        </div>
      </div>

      {/* Domain Cards Grid */}
      <div className="space-y-4">
        <h2 className="font-heading text-xs uppercase tracking-widest text-platinum/60">
          Canonical CMS Domains
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Site Content */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                  <LayoutPanelLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-white">Site Content</h3>
                  <p className="text-xs text-platinum/60">Identity & Hero</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Global brand copy, tagline animation strings, and contact details from canonical SiteSettings.
              </p>
            </div>
            <Link
              href="/admin/dashboard/site-content"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              Open Domain <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Roles */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-medium text-white">Roles</h3>
                    <p className="text-xs text-platinum/60">{stats.roles.total} positions</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Manage professional positions, founder tenures, and leadership roles.
              </p>
            </div>
            <Link
              href="/admin/dashboard/experience/roles"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              View Roles ({stats.roles.total}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Education */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-medium text-white">Education</h3>
                    <p className="text-xs text-platinum/60">{stats.education.total} institutions</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Manage degree programs, academic history, and university credentials.
              </p>
            </div>
            <Link
              href="/admin/dashboard/experience/education"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              View Education ({stats.education.total}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Work / Projects */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-white">Projects</h3>
                  <p className="text-xs text-platinum/60">{stats.projects.total} total projects</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Featured work, tech stack tags, repository URLs, and live demo links.
              </p>
            </div>
            <Link
              href="/admin/dashboard/projects"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              Open Editor ({stats.projects.total}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Skills */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-white">Skills</h3>
                  <p className="text-xs text-platinum/60">{stats.skills.total} skills</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Technologies, frameworks, tools, and technical skill taxonomy.
              </p>
            </div>
            <Link
              href="/admin/dashboard/skills"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              View Skills ({stats.skills.total}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Events */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-white">Events</h3>
                  <p className="text-xs text-platinum/60">{stats.events.total} records</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Hackathons, speaking engagements, conferences, and competitions.
              </p>
            </div>
            <Link
              href="/admin/dashboard/events"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              View Events ({stats.events.total}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Awards */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-white">Awards</h3>
                  <p className="text-xs text-platinum/60">{stats.awards.total} awards</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Competition wins, academic honors, and formal recognitions.
              </p>
            </div>
            <Link
              href="/admin/dashboard/achievements/awards"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              View Awards ({stats.awards.total}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Certifications */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                  <Award className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-white">Certifications</h3>
                  <p className="text-xs text-platinum/60">{stats.certifications.total} certificates</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Professional certificates, credentials, and verification links.
              </p>
            </div>
            <Link
              href="/admin/dashboard/achievements/certifications"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              View Certifications ({stats.certifications.total}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Resume */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-white">Resume</h3>
                  <p className="text-xs text-platinum/60">{stats.resumes.active} active PDF</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Upload and activate downloadable PDF resume files for public download.
              </p>
            </div>
            <Link
              href="/admin/dashboard/resume"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              Open Editor <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-oxfordBlue/80 bg-oxfordBlue/30 p-5 flex flex-col justify-between hover:border-orangeWeb/40 transition-colors">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orangeWeb/10 text-orangeWeb">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-medium text-white">SEO & Metadata</h3>
                  <p className="text-xs text-platinum/60">OpenGraph & Social</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-platinum/70 leading-relaxed">
                Site title, meta description, share card previews, and index settings.
              </p>
            </div>
            <Link
              href="/admin/dashboard/seo"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orangeWeb hover:underline"
            >
              View Settings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
