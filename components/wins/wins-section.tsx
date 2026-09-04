import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import WinsGrid from "./wins-grid";
import { WinOrAwardItem } from "./win-card";
import { typography } from "@/lib/typography";

interface WinsSectionProps {
  wins: WinOrAwardItem[];
}

export default function WinsSection({ wins }: WinsSectionProps) {
  return (
    <SectionWrapper id="wins" className="bg-black/40 py-24 px-4 sm:px-6 lg:px-8 border-y border-platinum/10">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <SectionItem>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-orangeWeb tracking-widest uppercase">
              04 // RECOGNITION
            </span>
          </div>
          <h2 className={typography.sectionTitle}>
            Achievements & Recognition
          </h2>
          <p className={`mt-3 max-w-2xl ${typography.sectionDescription}`}>
            Competitive hackathon victories, industry awards, and verified technical milestones.
          </p>
        </SectionItem>

        <WinsGrid wins={wins} />
      </div>
    </SectionWrapper>
  );
}
