"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, FolderGit2, Trophy } from "lucide-react";
import type { PublicProject } from "@/lib/public/projects";
import { normalizeProjectBadgeLabel } from "@/lib/project-badges";

interface ProjectCardProps {
  project: PublicProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const badgeLabel = normalizeProjectBadgeLabel(project.badge);
  const primaryImage = project.imageUrl || project.images?.[0];
  const isFlagship = Boolean(project.hasCaseStudy);

  return (
    <div
      className={`group flex h-full flex-col rounded-xl border transition-all overflow-hidden bg-black/60 backdrop-blur-sm ${
        isFlagship
          ? "border-orangeWeb/50 shadow-[0_0_24px_rgba(252,163,17,0.15)] hover:border-orangeWeb hover:shadow-[0_0_32px_rgba(252,163,17,0.25)]"
          : "border-platinum/15 hover:border-orangeWeb/40 hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
      }`}
    >
      
      {/* Image Section */}
      {primaryImage ? (
        <div className="relative aspect-video w-full overflow-hidden bg-black/40 border-b border-platinum/10">
          <Image
            src={primaryImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-${project.imageFit === "contain" ? "contain" : "cover"} transition-transform duration-300 group-hover:scale-105`}
          />
          {isFlagship && (
            <div className="absolute top-2.5 left-2.5 z-10 rounded bg-black/85 border border-orangeWeb/60 px-2 py-0.5 font-mono text-[10px] font-bold text-orangeWeb tracking-widest uppercase backdrop-blur-md">
              ★ FLAGSHIP CASE STUDY
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex aspect-video items-center justify-center bg-oxfordBlue/40 border-b border-platinum/10">
          <p className="text-xs font-mono text-platinum/50">NO_MEDIA_SOURCE</p>
          {isFlagship && (
            <div className="absolute top-2.5 left-2.5 z-10 rounded bg-black/85 border border-orangeWeb/60 px-2 py-0.5 font-mono text-[10px] font-bold text-orangeWeb tracking-widest uppercase backdrop-blur-md">
              ★ FLAGSHIP CASE STUDY
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        
        {/* Title + Badges */}
        <div className="space-y-2">
          {badgeLabel && (
            <span className="inline-flex items-center gap-1 rounded bg-orangeWeb/10 border border-orangeWeb/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-orangeWeb uppercase">
              <Trophy className="h-2.5 w-2.5" aria-hidden="true" />
              {badgeLabel}
            </span>
          )}
          <h3 className="line-clamp-2 text-base font-semibold text-white transition-colors group-hover:text-orangeWeb">
            {project.title}
          </h3>
          {project.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-platinum/80">
              {project.description}
            </p>
          )}
        </div>

        {/* Links / CTAs */}
        {(project.liveUrl || project.githubUrl || project.hasCaseStudy) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-platinum/10">
            {project.hasCaseStudy && project.caseStudyUrl && (
              <Link
                href={project.caseStudyUrl}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded border border-orangeWeb bg-orangeWeb px-3 py-1.5 font-mono text-xs font-bold text-black transition-all hover:bg-orangeWeb/90 shadow-md"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Case Study
              </Link>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded border border-platinum/20 bg-black/60 px-2.5 py-1.5 font-mono text-xs font-semibold text-white transition-colors hover:border-orangeWeb hover:text-orangeWeb"
              >
                Live
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded border border-platinum/20 bg-black/60 px-2.5 py-1.5 font-mono text-xs font-semibold text-platinum/80 transition-colors hover:border-orangeWeb hover:text-orangeWeb"
              >
                <FolderGit2 className="h-3 w-3" aria-hidden="true" />
                Code
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
