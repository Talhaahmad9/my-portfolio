import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import ProjectCard from "./project-card";
import { IProject } from "@/lib/db/models/Project";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectGrid({ projects }: { projects: IProject[] }) {
  return (
    <SectionWrapper id="projects" className="bg-oxfordBlue py-24 px-6">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <SectionItem>
          <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb mb-2">
            Work
          </p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Projects
          </h2>
          <p className="mt-3 max-w-xl text-platinum">
            From GenAI hackathon wins to live production apps — here&apos;s
            what I&apos;ve shipped.
          </p>
        </SectionItem>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {projects.length === 0 ? (
            <SectionItem>
              <div className="group flex h-full flex-col items-center justify-center rounded-lg border border-platinum/10 bg-black p-12 transition-colors hover:border-orangeWeb text-center">
                <p className="text-lg font-medium text-platinum">Projects coming soon</p>
              </div>
            </SectionItem>
          ) : (
            projects.map((project) => (
              <SectionItem key={project._id ? String(project._id) : project.title}>
                <ProjectCard project={project} />
              </SectionItem>
            ))
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
