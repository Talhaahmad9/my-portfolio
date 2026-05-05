import { IWin } from "@/lib/db/models/Win";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import WinsGrid from "./wins-grid";
import { Trophy } from "lucide-react";
import { typography } from "@/lib/typography";

interface WinsSectionProps {
  wins: IWin[];
}

export default function WinsSection({ wins }: WinsSectionProps) {
  return (
    <SectionWrapper id="wins" className="bg-oxfordBlue/20 py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <SectionItem>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-orangeWeb" />
            <p className={typography.sectionEyebrow}>
              Hall of Fame
            </p>
          </div>
          <h2 className={typography.sectionTitle}>
            Achievements & Recognition
          </h2>
          <p className={`mt-3 max-w-2xl ${typography.sectionDescription}`}>
            Competitions, hackathons, and milestones
          </p>
        </SectionItem>

        <WinsGrid wins={wins} />
      </div>
    </SectionWrapper>
  );
}
