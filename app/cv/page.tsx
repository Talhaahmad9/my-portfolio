import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Award as AwardIcon,
  Briefcase,
  Download,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getCvData } from "@/lib/public/cv";
import { getDownloadFilename } from "@/lib/getDownloadFilename";

export async function generateMetadata(): Promise<Metadata> {
  let title = "Talha Ahmad — Interactive CV | Full-Stack Developer";
  let description =
    "Professional Interactive CV of Talha Ahmad — Full-Stack Developer & AI Systems Engineer.";
  let noIndex = false;

  try {
    const data = await getCvData();
    title = `${data.siteContent.identity.fullName} — Interactive CV | ${data.siteContent.identity.headline}`;
    description = data.siteContent.hero.subtitle;
    noIndex = data.seo.noIndex;
  } catch (error) {
    console.error("Failed to load CV metadata:", error);
  }

  const siteOrigin = "https://talhaahmad.me";

  return {
    title,
    description,
    metadataBase: new URL(siteOrigin),
    alternates: {
      canonical: `${siteOrigin}/cv`,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "profile",
      locale: "en_US",
      url: `${siteOrigin}/cv`,
      title,
      description,
      siteName: "Talha Ahmad Portfolio",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CvPage() {
  const data = await getCvData();
  const {
    siteContent,
    experience,
    skillGroups,
    selectedProjects,
    awards,
    certifications,
    resume,
  } = data;

  const downloadFilename = getDownloadFilename(
    resume?.label ?? null,
    resume?.fileUrl ?? null
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": siteContent.identity.fullName || "Talha Ahmad",
      "jobTitle": siteContent.identity.headline,
      "url": "https://talhaahmad.me/cv",
      "sameAs": siteContent.socials.map((s) => s.url).filter(Boolean)
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white print:bg-white print:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 print:max-w-none print:px-0 print:py-0">
        
        {/* Top Bar / Navigation (Hidden in Print) */}
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-platinum transition-colors hover:text-orangeWeb"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Homepage
          </Link>

          {resume?.fileUrl && (
            <a
              href="/api/resume/download"
              target="_blank"
              rel="noopener noreferrer"
              download={downloadFilename}
              className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-orangeWeb/90 shadow-[0_0_16px_rgba(252,163,17,0.2)]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download PDF Resume
            </a>
          )}
        </div>

        {/* CV Document Container */}
        <div className="rounded-2xl border border-platinum/10 bg-oxfordBlue/40 p-6 shadow-2xl backdrop-blur-md sm:p-10 print:border-none print:bg-transparent print:p-0 print:shadow-none">
          
          {/* 1. HEADER / IDENTITY */}
          <header className="border-b border-platinum/10 pb-8 print:border-gray-300 print:pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white print:text-black">
                  {siteContent.identity.fullName}
                </h1>
                <p className="mt-1.5 text-lg font-medium text-orangeWeb print:text-gray-800">
                  {siteContent.identity.headline}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-platinum/75 print:text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-orangeWeb print:text-black" aria-hidden="true" />
                    {siteContent.identity.location}
                  </span>
                  <a
                    href={`mailto:${siteContent.contact.email}`}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-orangeWeb print:text-black"
                  >
                    <Mail className="h-3.5 w-3.5 text-orangeWeb print:text-black" aria-hidden="true" />
                    {siteContent.contact.email}
                  </a>
                </div>
              </div>

              {/* Socials & Quick Links */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 print:hidden">
                {siteContent.socials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-platinum/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-platinum transition-colors hover:border-orangeWeb hover:text-orangeWeb"
                  >
                    {s.platform === "GitHub" ? (
                      <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : s.platform === "LinkedIn" ? (
                      <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {s.label || s.platform}
                  </a>
                ))}
              </div>
            </div>
          </header>

          {/* 2. PROFESSIONAL SUMMARY */}
          <section className="border-b border-platinum/10 py-6 print:border-gray-300 print:py-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb print:text-black">
              Professional Summary
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-platinum/90 print:text-gray-800">
              {siteContent.hero.subtitle}
            </p>
            {siteContent.about.bioParagraphs.map((paragraph, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-platinum/80 print:text-gray-700">
                {paragraph}
              </p>
            ))}
          </section>

          {/* 3. EXPERIENCE */}
          <section className="border-b border-platinum/10 py-6 print:border-gray-300 print:py-4">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb print:text-black">
              <Briefcase className="h-4 w-4 text-orangeWeb print:text-black" aria-hidden="true" />
              Work & Leadership Experience
            </h2>
            <div className="mt-4 space-y-6">
              {experience.roles.map((role) => (
                <article key={role.id} className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-base font-semibold text-white print:text-black">
                      {role.roleTitle} <span className="font-normal text-platinum/70 print:text-gray-600">at {role.organization}</span>
                    </h3>
                    <span className="mt-0.5 text-xs font-medium text-orangeWeb/90 print:text-gray-600">
                      {role.periodText}
                    </span>
                  </div>
                  {role.location && (
                    <p className="mt-0.5 text-xs text-platinum/60 print:text-gray-500">
                      {role.location}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-platinum/85 print:text-gray-800">
                    {role.summary}
                  </p>
                  {role.highlights.length > 0 && (
                    <ul className="mt-2.5 list-disc space-y-1 pl-4 text-xs text-platinum/75 print:text-gray-700">
                      {role.highlights.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* 4. EDUCATION */}
          <section className="border-b border-platinum/10 py-6 print:border-gray-300 print:py-4">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb print:text-black">
              <GraduationCap className="h-4 w-4 text-orangeWeb print:text-black" aria-hidden="true" />
              Education
            </h2>
            <div className="mt-4 space-y-4">
              {experience.education.map((edu) => (
                <article key={edu.id}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-base font-semibold text-white print:text-black">
                      {edu.institution}
                    </h3>
                    <span className="mt-0.5 text-xs font-medium text-orangeWeb/90 print:text-gray-600">
                      {edu.periodText}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-platinum/85 print:text-gray-800">
                    {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                  </p>
                  {edu.location && (
                    <p className="mt-0.5 text-xs text-platinum/60 print:text-gray-500">
                      {edu.location}
                    </p>
                  )}
                  {edu.summary && (
                    <p className="mt-2 text-xs leading-relaxed text-platinum/75 print:text-gray-700">
                      {edu.summary}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* 5. SELECTED PROJECTS */}
          <section className="border-b border-platinum/10 py-6 print:border-gray-300 print:py-4">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb print:text-black">
              <Sparkles className="h-4 w-4 text-orangeWeb print:text-black" aria-hidden="true" />
              Featured Projects
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {selectedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex flex-col justify-between rounded-xl border border-platinum/10 bg-black/30 p-4 transition-colors hover:border-orangeWeb/40 print:border-gray-200 print:bg-transparent"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white print:text-black">
                        {proj.title}
                      </h3>
                      {proj.badge && (
                        <span className="shrink-0 rounded bg-orangeWeb/10 px-1.5 py-0.5 text-[10px] font-semibold text-orangeWeb print:text-black">
                          {proj.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-platinum/75 print:text-gray-700 line-clamp-3">
                      {proj.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-platinum/5 print:border-gray-200">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {proj.technologies.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-platinum/10 px-1.5 py-0.5 text-[10px] font-medium text-platinum/80 print:bg-gray-100 print:text-black"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium print:hidden">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-orangeWeb hover:underline"
                        >
                          Live Demo <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-platinum/70 hover:text-white"
                        >
                          Code <FolderGit2 className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. TECHNICAL SKILLS */}
          <section className="border-b border-platinum/10 py-6 print:border-gray-300 print:py-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb print:text-black">
              Technical Skills
            </h2>
            <div className="mt-4 space-y-3">
              {skillGroups.map((group) => (
                <div key={group.category} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                  <span className="w-36 shrink-0 text-xs font-semibold text-platinum/90 print:text-black">
                    {group.category}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-md border border-platinum/10 bg-black/40 px-2 py-0.5 text-xs text-platinum/80 print:border-gray-300 print:bg-transparent print:text-black"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. HONORS & AWARDS */}
          {awards.length > 0 && (
            <section className="border-b border-platinum/10 py-6 print:border-gray-300 print:py-4">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb print:text-black">
                <Trophy className="h-4 w-4 text-orangeWeb print:text-black" aria-hidden="true" />
                Honors & Competition Awards
              </h2>
              <div className="mt-4 space-y-4">
                {awards.map((award) => (
                  <article key={award.id} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white print:text-black">
                        {award.title}
                        {award.eventLabel && (
                          <span className="font-normal text-platinum/70 print:text-gray-600"> — {award.eventLabel}</span>
                        )}
                      </h3>
                      {award.placement && (
                        <p className="mt-0.5 text-xs text-orangeWeb print:text-gray-800 font-medium">
                          {award.placement} {award.score ? `(${award.score})` : ""}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* 8. CERTIFICATIONS */}
          {certifications.length > 0 && (
            <section className="py-6 print:py-4">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb print:text-black">
                <AwardIcon className="h-4 w-4 text-orangeWeb print:text-black" aria-hidden="true" />
                Certifications & Verification
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between rounded-xl border border-platinum/10 bg-black/30 p-3 print:border-gray-200"
                  >
                    <div>
                      <h3 className="text-xs font-semibold text-white print:text-black">
                        {cert.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-platinum/70 print:text-gray-600">
                        Issued by {cert.issuer}
                      </p>
                    </div>
                    <Link
                      href={`/certificates/${cert.publicId}`}
                      className="inline-flex items-center gap-1 rounded bg-orangeWeb/10 px-2 py-1 text-[11px] font-semibold text-orangeWeb hover:bg-orangeWeb/20 print:hidden"
                    >
                      Verify <ShieldCheck className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 9. FOOTER / DOWNLOAD CTA */}
          <footer className="mt-8 border-t border-platinum/10 pt-6 text-center print:hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-platinum/60">
                Canonical Interactive CV — Updated from live portfolio CMS.
              </p>
              {resume?.fileUrl && (
                <a
                  href="/api/resume/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  download={downloadFilename}
                  className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-orangeWeb/90"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download Complete PDF CV
                </a>
              )}
            </div>
          </footer>

        </div>
      </div>
    </main>
  );
}
