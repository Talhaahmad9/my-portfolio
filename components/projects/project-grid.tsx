import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import ProjectCard from "./project-card";
import ProjectShowcase from "./project-showcase";
import { IProject } from "@/lib/db/models/Project";
import { typography } from "@/lib/typography";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectGrid({ projects }: { projects: IProject[] }) {
  const useShowcase = projects.length >= 3;

  return (
    <SectionWrapper id="projects" className="bg-black/40 py-24 px-6">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <SectionItem>
          <p className={`mb-2 ${typography.sectionEyebrow}`}>
            Work
          </p>
          <h2 className={typography.sectionTitle}>
            Projects
          </h2>
          <p className={`mt-3 max-w-2xl ${typography.sectionDescription}`}>
            From GenAI hackathon wins to live production apps — here&apos;s
            what I&apos;ve shipped.
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
              <SectionItem key={project._id ? String(project._id) : project.title}>
                <ProjectCard project={project} />
              </SectionItem>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
