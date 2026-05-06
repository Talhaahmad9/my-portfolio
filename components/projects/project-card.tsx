"use client";

import Image from "next/image";
import { ArrowUpRight, FolderGit2, Trophy } from "lucide-react";
import { IProject } from "@/lib/db/models/Project";
import { normalizeProjectBadgeLabel } from "@/lib/project-badges";
import { typography } from "@/lib/typography";

interface ProjectCardProps {
  project: IProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const badgeLabel = normalizeProjectBadgeLabel(project.badge);
  const primaryImage = project.images?.[0];

  return (
    <div className="group flex h-full flex-col rounded-lg border border-platinum/10 bg-black transition-all hover:border-orangeWeb hover:shadow-[0_0_24px_rgba(252,163,17,0.15)] overflow-hidden">
      
      {/* Image Section */}
      {primaryImage ? (
        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
          <Image
            src={primaryImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-${project.imageFit === "contain" ? "contain" : "cover"} transition-transform duration-300 group-hover:scale-105`}
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-oxfordBlue/40">
          <p className="text-sm text-platinum/60">No image</p>
        </div>
      )}

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between gap-2 p-3">
        
        {/* Title + Badge */}
        <div className="space-y-1.5">
          {badgeLabel && (
            <span className="inline-flex items-center gap-0.5 rounded-sm bg-orangeWeb/10 px-1.5 py-0.5 text-[10px] font-semibold text-orangeWeb">
              <Trophy className="h-2.5 w-2.5" aria-hidden="true" />
              {badgeLabel}
            </span>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold text-white transition-colors group-hover:text-orangeWeb">
            {project.title}
          </h3>
        </div>

        {/* Links */}
        {(project.liveUrl || project.githubUrl) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-0.5 rounded-sm bg-orangeWeb px-1.5 py-0.5 text-[10px] font-semibold text-black transition-colors hover:bg-orangeWeb/90"
              >
                Live
                <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-0.5 rounded-sm border border-platinum/30 px-1.5 py-0.5 text-[10px] font-semibold text-platinum transition-colors hover:border-orangeWeb hover:text-orangeWeb"
              >
                <FolderGit2 className="h-2.5 w-2.5" aria-hidden="true" />
                Code
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
