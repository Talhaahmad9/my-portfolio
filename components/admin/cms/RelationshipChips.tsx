import React from "react";

export interface ResolvedChipItem {
  id: string;
  name: string;
  isMissing?: boolean;
}

interface RelationshipChipsProps {
  label?: string;
  items: ResolvedChipItem[];
  emptyMessage?: string;
}

export function RelationshipChips({
  label,
  items,
  emptyMessage = "None linked",
}: RelationshipChipsProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-xs text-zinc-500 italic">
        {label && <span className="font-medium text-zinc-400 mr-1">{label}:</span>}
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {label && <span className="font-medium text-zinc-400 mr-1">{label}:</span>}
      {items.map((item) =>
        item.isMissing ? (
          <span
            key={item.id}
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20"
          >
            ⚠️ {item.name}
          </span>
        ) : (
          <span
            key={item.id}
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
          >
            {item.name}
          </span>
        )
      )}
    </div>
  );
}
