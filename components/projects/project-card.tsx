"use client";

import { ArrowRight, ArrowUpRight, Trophy } from "lucide-react";
import { IProject } from "@/lib/db/models/Project";
import { normalizeProjectBadgeLabel } from "@/lib/project-badges";
import { typography } from "@/lib/typography";
import ProjectCarousel from "./project-carousel";

interface ProjectCardProps {
  project: IProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const badgeLabel = normalizeProjectBadgeLabel(project.badge);

  return (
    <div className="group flex h-full flex-col rounded-lg border border-platinum/10 bg-black p-6 transition-colors hover:border-orangeWeb overflow-hidden">
      
      {project.images && project.images.length > 0 && (
        <div className="-mx-6 -mt-6 mb-6">
          <ProjectCarousel images={project.images} title={project.title} imageFit={project.imageFit ?? "cover"} />
        </div>
      )}

      {/* Badge */}
      {badgeLabel && (
        <span className="mb-4 inline-flex items-center gap-2 self-start rounded-md bg-orangeWeb px-3 py-1.5 text-sm font-semibold text-black">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          {badgeLabel}
        </span>
      )}

      {/* Title */}
      <h3 className={`${typography.cardTitle} transition-colors group-hover:text-orangeWeb`}>
        {project.title}
      </h3>

      {/* Description */}
      <p className={`mt-3 ${typography.cardBody}`}>
        {project.description}
      </p>

      {/* Bullets */}
      <ul className="mt-4 space-y-1.5 flex-1">
        {project.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-base text-platinum">
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-orangeWeb" aria-hidden="true" />
            {b}
          </li>
        ))}
      </ul>

      {/* Tags */}
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-platinum/20 px-3 py-1 text-sm text-platinum"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Links */}
      {(project.liveUrl || project.githubUrl) && (
        <div className="mt-auto flex items-center gap-4 border-t border-platinum/10 pt-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-orangeWeb underline-offset-4 hover:underline"
            >
              Live
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-platinum transition-colors hover:text-orangeWeb"
            >
              GitHub
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
