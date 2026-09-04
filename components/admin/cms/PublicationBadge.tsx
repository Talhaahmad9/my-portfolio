import React from "react";
import { PublicationStatus } from "@/lib/cms/types";

interface PublicationBadgeProps {
  status: PublicationStatus;
}

export function PublicationBadge({ status }: PublicationBadgeProps) {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Published
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
          Archived
        </span>
      );
    case "draft":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Draft
        </span>
      );
  }
}
