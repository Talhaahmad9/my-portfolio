"use client";

import { IWin } from "@/lib/db/models/Win";
import { Trophy } from "lucide-react";
import { typography } from "@/lib/typography";

interface WinCardProps {
  win: IWin;
}

export default function WinCard({ win }: WinCardProps) {
  const getBadgeColors = (place: string) => {
    const p = place.toLowerCase();
    if (p.includes("1st")) return "bg-orangeWeb text-black border border-transparent";
    if (p.includes("2nd")) return "bg-platinum text-black border border-transparent";
    if (p.includes("3rd")) return "bg-transparent border border-oxfordBlue text-platinum";
    return "bg-transparent border border-oxfordBlue text-platinum";
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(win.date));

  return (
    <div className="group flex h-full flex-col rounded-lg border border-platinum/10 bg-oxfordBlue p-6 transition-colors hover:border-orangeWeb">
      <div className="flex items-start justify-between gap-4 mb-4">
        <Trophy size={20} className="text-orangeWeb shrink-0" />
        <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${getBadgeColors(win.place)}`}>
          {win.place}
        </span>
      </div>

      <h3 className={typography.cardTitle}>
        {win.title}
      </h3>
      
      <p className="mt-2 text-base text-platinum">
        {win.event}
      </p>

      {win.score && (
        <p className="mt-3 text-base font-medium text-orangeWeb">
          Score: {win.score}
        </p>
      )}

      {win.description && (
        <p className="mt-3 flex-1 text-base leading-7 text-platinum line-clamp-3">
          {win.description}
        </p>
      )}

      {win.stack && win.stack.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {win.stack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-platinum/20 px-3 py-1 text-sm text-platinum"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-5">
        <p className="text-sm text-platinum/60">
          {formattedDate}
        </p>
      </div>
    </div>
  );
}
