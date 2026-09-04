import React from "react";
import { Star } from "lucide-react";

interface FeaturedBadgeProps {
  featured?: boolean;
}

export function FeaturedBadge({ featured }: FeaturedBadgeProps) {
  if (!featured) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      Featured
    </span>
  );
}
