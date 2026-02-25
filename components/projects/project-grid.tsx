import { PROJECTS } from "@/lib/projects";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectGrid() {
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
          {PROJECTS.map((project) => (
            <SectionItem key={project.title}>
              <div className="group flex h-full flex-col rounded-lg border border-platinum/10 bg-black p-6 transition-colors hover:border-orangeWeb">

                {/* Badge */}
                {project.badge && (
                  <span className="mb-4 inline-block rounded-md bg-orangeWeb px-3 py-1 text-xs font-semibold text-black">
                    {project.badge}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-white group-hover:text-orangeWeb transition-colors">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm text-platinum">
                  {project.description}
                </p>

                {/* Bullets */}
                <ul className="mt-4 space-y-1.5 flex-1">
                  {project.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-platinum">
                      <span className="mt-1 shrink-0 text-orangeWeb text-xs">▹</span>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-platinum/20 px-3 py-0.5 text-xs text-platinum"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                {(project.liveUrl || project.githubUrl) && (
                  <div className="mt-5 flex items-center gap-4 border-t border-platinum/10 pt-4">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orangeWeb hover:underline underline-offset-4"
                      >
                        Live ↗
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-platinum hover:text-orangeWeb transition-colors"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </SectionItem>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
