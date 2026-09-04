import AchievementExplorer from "@/components/about/achievement-explorer";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import { typography } from "@/lib/typography";
import type { PublicSkillGroup } from "@/lib/public/skills";
import type { PublicAchievementHighlight, PublicEducationHighlight } from "@/lib/public/achievement-highlights";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AboutSectionProps {
  heading: string;
  bio?: string;
  bullets?: string[];
  bioParagraphs?: string[];
  corePillars?: string[];
  achievements: PublicAchievementHighlight[];
  education?: PublicEducationHighlight;
  skills: PublicSkillGroup[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutSection({
  heading,
  bio = "",
  bullets = [],
  bioParagraphs: bioParagraphsProp,
  corePillars: corePillarsProp,
  achievements,
  education,
  skills,
}: AboutSectionProps) {
  const aboutHeading = heading.trim() || "Full-Stack AI Developer";
  const bioParagraphs = bioParagraphsProp && bioParagraphsProp.length > 0
    ? bioParagraphsProp
    : bio
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
  const activeBullets = corePillarsProp && corePillarsProp.length > 0 ? corePillarsProp : bullets;
  const hasAchievements = achievements.length > 0;

  return (
    <SectionWrapper id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="mx-auto max-w-6xl">

        {/* Section heading */}
        <SectionItem>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-orangeWeb tracking-widest uppercase">
              02 // ABOUT
            </span>
          </div>
          <h2 className={typography.sectionTitle}>{aboutHeading}</h2>
        </SectionItem>

        {/* Two-column: bio left, achievement explorer right */}
        <div className={`mt-10 grid gap-10 ${hasAchievements ? "lg:grid-cols-12 lg:items-start" : ""}`}>

          {/* Bio */}
          <div className={hasAchievements ? "lg:col-span-7" : "w-full"}>
            <SectionItem>
              <div className="space-y-5 border-l-2 border-orangeWeb/40 pl-5 text-base sm:text-lg leading-relaxed text-platinum/90">
                {bioParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                {activeBullets.length > 0 && (
                  <ul className="space-y-2.5 pt-2 text-sm text-platinum marker:text-orangeWeb">
                    {activeBullets.map((bullet, i) => (
                      <li key={`${bullet}-${i}`} className="list-disc leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionItem>
          </div>

          {/* Achievement highlight card */}
          {hasAchievements && (
            <div className="lg:col-span-5">
              <SectionItem>
                <AchievementExplorer achievements={achievements} education={education} />
              </SectionItem>
            </div>
          )}
        </div>

        {/* Skills grid */}
        {skills.length > 0 && (
          <div className="mt-20">
            <SectionItem>
              <div className="mb-6 flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-orangeWeb tracking-widest uppercase">
                  TECHNICAL CAPABILITIES // SKILLS
                </span>
              </div>
            </SectionItem>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((group) => (
                <SectionItem key={group.category}>
                  <div className="group rounded-xl border border-platinum/10 bg-black/60 p-6 h-full transition-colors hover:border-orangeWeb/40">
                    <div className="mb-4 flex items-center justify-between border-b border-platinum/10 pb-3">
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-orangeWeb">
                        {group.category}
                      </h4>
                      <span className="font-mono text-[10px] text-platinum/40">
                        {group.items.length} SKILLS
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((skill) => (
                        <span
                          key={skill}
                          className="rounded border border-platinum/15 bg-oxfordBlue/40 px-2.5 py-1 text-xs font-medium text-platinum transition-colors group-hover:border-platinum/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </SectionItem>
              ))}
            </div>
          </div>
        )}

      </div>
    </SectionWrapper>
  );
}
