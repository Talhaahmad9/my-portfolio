import { IWin } from "@/lib/db/models/Win";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import WinsGrid from "./wins-grid";
import { Trophy } from "lucide-react";

interface WinsSectionProps {
  wins: IWin[];
}

export default function WinsSection({ wins }: WinsSectionProps) {
  return (
    <SectionWrapper id="wins" className="bg-black py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <SectionItem>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-orangeWeb" />
            <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb">
              Hall of Fame
            </p>
          </div>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Achievements & Recognition
          </h2>
          <p className="mt-3 max-w-xl text-platinum">
            Competitions, hackathons, and milestones
          </p>
        </SectionItem>

        <WinsGrid wins={wins} />
      </div>
    </SectionWrapper>
  );
}
