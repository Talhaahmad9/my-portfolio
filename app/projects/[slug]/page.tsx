import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  FileText,
  FolderGit2,
  Layers,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { getPublicCaseStudyBySlug } from "@/lib/public/project-case-study";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getPublicCaseStudyBySlug(slug);

  if (!caseStudy) {
    return {
      title: "Project Not Found | Talha Ahmad",
      robots: { index: false, follow: false },
    };
  }

  const siteOrigin = "https://talhaahmad.me";
  const canonicalUrl = `${siteOrigin}/projects/${caseStudy.slug}`;

  return {
    title: caseStudy.seo.metaTitle,
    description: caseStudy.seo.metaDescription,
    keywords: caseStudy.seo.keywords,
    metadataBase: new URL(siteOrigin),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: caseStudy.seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "article",
      locale: "en_US",
      url: canonicalUrl,
      title: caseStudy.seo.metaTitle,
      description: caseStudy.seo.metaDescription,
      siteName: "Talha Ahmad Portfolio",
      images: caseStudy.seo.ogImageUrl
        ? [
            {
              url: caseStudy.seo.ogImageUrl,
              alt: caseStudy.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: caseStudy.seo.metaTitle,
      description: caseStudy.seo.metaDescription,
      images: caseStudy.seo.ogImageUrl ? [caseStudy.seo.ogImageUrl] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = await getPublicCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": caseStudy.projectType === "startup" || caseStudy.projectType === "SaaS" ? "SoftwareApplication" : "CreativeWork",
    "name": caseStudy.title,
    "description": caseStudy.shortDescription,
    "url": caseStudy.demoUrl || `https://talhaahmad.me/projects/${caseStudy.slug}`,
    "author": {
      "@type": "Person",
      "name": "Talha Ahmad"
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        
        {/* Top Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-platinum transition-colors hover:text-orangeWeb"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>

          <div className="flex items-center gap-3">
            {caseStudy.demoUrl && (
              <a
                href={caseStudy.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-orangeWeb px-3.5 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-orangeWeb/90 shadow-[0_0_16px_rgba(252,163,17,0.2)]"
              >
                Live Demo <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {caseStudy.githubUrl && (
              <a
                href={caseStudy.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-platinum/20 bg-black/40 px-3.5 py-1.5 text-xs font-medium text-platinum transition-colors hover:border-orangeWeb hover:text-orangeWeb"
              >
                <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                Repository
              </a>
            )}
          </div>
        </div>

        {/* Case Study Body Container */}
        <article className="rounded-2xl border border-platinum/10 bg-oxfordBlue/40 p-6 shadow-2xl backdrop-blur-md sm:p-10">
          
          {/* Header & Overview */}
          <header className="border-b border-platinum/10 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-orangeWeb/10 px-2 py-0.5 text-xs font-semibold text-orangeWeb">
                Case Study
              </span>
              {caseStudy.category && (
                <span className="rounded bg-platinum/10 px-2 py-0.5 text-xs font-medium text-platinum/80 uppercase tracking-wider">
                  {caseStudy.category.replace("_", " ")}
                </span>
              )}
              {caseStudy.projectType && (
                <span className="rounded bg-platinum/10 px-2 py-0.5 text-xs font-medium text-platinum/80 capitalize">
                  {caseStudy.projectType}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {caseStudy.title}
            </h1>

            {caseStudy.tagline && (
              <p className="mt-2 text-lg font-medium text-orangeWeb/90">
                {caseStudy.tagline}
              </p>
            )}

            <p className="mt-4 text-base leading-relaxed text-platinum/90 sm:text-lg">
              {caseStudy.shortDescription}
            </p>
          </header>

          {/* Key Metrics Grid (if present) */}
          {caseStudy.metrics.length > 0 && (
            <section className="border-b border-platinum/10 py-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb">
                Impact & Key Metrics
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {caseStudy.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-baseline justify-between rounded-xl border border-platinum/10 bg-black/40 p-4"
                  >
                    <span className="text-xs font-medium text-platinum/75">
                      {m.label}
                    </span>
                    <span className="text-xl font-bold text-orangeWeb">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Technology Stack / Skills */}
          {caseStudy.skills.length > 0 && (
            <section className="border-b border-platinum/10 py-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb">
                <Cpu className="h-4 w-4 text-orangeWeb" aria-hidden="true" />
                Technology Stack & Skills
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {caseStudy.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-md border border-platinum/15 bg-black/40 px-3 py-1 text-xs font-medium text-platinum"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Detailed Narrative / Long Description */}
          {caseStudy.longDescription && (
            <section className="border-b border-platinum/10 py-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb">
                <Sparkles className="h-4 w-4 text-orangeWeb" aria-hidden="true" />
                Project Overview & Scope
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-platinum/85 sm:text-base">
                {caseStudy.longDescription.split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {/* System Architecture */}
          {caseStudy.architectureOverview && (
            <section className="border-b border-platinum/10 py-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb">
                <Layers className="h-4 w-4 text-orangeWeb" aria-hidden="true" />
                System Architecture & Data Flow
              </h2>
              <div className="mt-4 rounded-xl border border-platinum/10 bg-black/50 p-4 sm:p-5">
                <p className="font-mono text-xs leading-relaxed text-platinum/90 whitespace-pre-line sm:text-sm">
                  {caseStudy.architectureOverview}
                </p>
              </div>
            </section>
          )}

          {/* Technical Decisions */}
          {caseStudy.technicalDecisions.length > 0 && (
            <section className="border-b border-platinum/10 py-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb">
                <Lightbulb className="h-4 w-4 text-orangeWeb" aria-hidden="true" />
                Key Technical Decisions
              </h2>
              <div className="mt-4 space-y-4">
                {caseStudy.technicalDecisions.map((dec, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-platinum/10 bg-black/30 p-4 sm:p-5"
                  >
                    <h3 className="text-base font-semibold text-white">
                      {dec.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-platinum/75 leading-relaxed">
                      <strong className="text-platinum">Context:</strong> {dec.context}
                    </p>
                    <p className="mt-1 text-xs text-orangeWeb/90 leading-relaxed font-medium">
                      <strong className="text-platinum">Decision:</strong> {dec.decision}
                    </p>
                    {dec.consequences.length > 0 && (
                      <ul className="mt-2.5 list-disc pl-4 space-y-1 text-xs text-platinum/80">
                        {dec.consequences.map((c, cIdx) => (
                          <li key={cIdx}>{c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Technical Challenges & Solutions */}
          {caseStudy.challenges.length > 0 && (
            <section className="border-b border-platinum/10 py-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb">
                <ShieldAlert className="h-4 w-4 text-orangeWeb" aria-hidden="true" />
                Technical Challenges & Solutions
              </h2>
              <div className="mt-4 space-y-4">
                {caseStudy.challenges.map((c, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-platinum/10 bg-black/30 p-4 sm:p-5"
                  >
                    <h3 className="text-base font-semibold text-white">
                      {c.title}
                    </h3>
                    <div className="mt-2 space-y-2 text-xs text-platinum/85">
                      <p>
                        <strong className="text-orangeWeb">Problem:</strong> {c.problem}
                      </p>
                      <p>
                        <strong className="text-platinum">Solution:</strong> {c.solution}
                      </p>
                      <p className="text-platinum/75">
                        <strong className="text-platinum">Impact:</strong> {c.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Outcomes & Results */}
          {caseStudy.outcomes.length > 0 && (
            <section className="py-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orangeWeb">
                <CheckCircle2 className="h-4 w-4 text-orangeWeb" aria-hidden="true" />
                Key Outcomes & Verification
              </h2>
              <ul className="mt-4 space-y-2.5">
                {caseStudy.outcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-platinum/90">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orangeWeb" aria-hidden="true" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Footer & Actions */}
          <footer className="mt-8 border-t border-platinum/10 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 text-xs font-medium text-platinum/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to All Projects
              </Link>

              <div className="flex items-center gap-3">
                {caseStudy.demoUrl && (
                  <a
                    href={caseStudy.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-orangeWeb px-3 py-1.5 text-xs font-semibold text-black hover:bg-orangeWeb/90"
                  >
                    Visit Live Project <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                {caseStudy.documentationUrl && (
                  <a
                    href={caseStudy.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded border border-platinum/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-platinum hover:text-white"
                  >
                    Documentation <FileText className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </footer>

        </article>
      </div>
    </main>
  );
}
