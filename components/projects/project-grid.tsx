import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import ProjectCard from "./project-card";
import ProjectShowcase from "./project-showcase";
import type { PublicProject } from "@/lib/public/projects";
import { typography } from "@/lib/typography";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectGrid({ projects }: { projects: PublicProject[] }) {
  const useShowcase = projects.length > 3;

  return (
    <SectionWrapper id="projects" className="bg-black/40 py-24 px-6">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <SectionItem>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-orangeWeb tracking-widest uppercase">
              03 // SELECTED WORK
            </span>
          </div>
          <h2 className={typography.sectionTitle}>
            Featured Projects & Case Studies
          </h2>
          <p className={`mt-3 max-w-2xl ${typography.sectionDescription}`}>
            From flagship production architectures to AI hackathon solutions — here&apos;s
            what I&apos;ve engineered.
          </p>
        </SectionItem>

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <SectionItem>
              <div className="group flex h-full flex-col items-center justify-center rounded-lg border border-platinum/10 bg-black p-12 text-center transition-colors hover:border-orangeWeb">
                <p className="font-heading text-xl font-medium text-platinum">Projects coming soon</p>
              </div>
            </SectionItem>
          </div>
        ) : useShowcase ? (
          <SectionItem>
            <ProjectShowcase projects={projects} />
          </SectionItem>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <SectionItem key={project.id || project.title}>
                <ProjectCard project={project} />
              </SectionItem>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
