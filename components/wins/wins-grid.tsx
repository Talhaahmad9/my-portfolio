"use client";

import { SectionItem } from "@/components/shared/section-wrapper";
import WinCard, { WinOrAwardItem } from "./win-card";

interface WinsGridProps {
  wins: WinOrAwardItem[];
}

export default function WinsGrid({ wins }: WinsGridProps) {
  return (
    <div className="mt-12">
      {wins.length === 0 ? (
        <SectionItem>
          <p className="italic text-platinum">No achievements listed yet</p>
        </SectionItem>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wins.map((win) => (
            <SectionItem key={win._id ? String(win._id) : win.id || win.title}>
              <WinCard win={win} />
            </SectionItem>
          ))}
        </div>
      )}
    </div>
  );
}
