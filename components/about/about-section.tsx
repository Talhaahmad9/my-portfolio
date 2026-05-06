import AchievementSlideshow from "@/components/about/achievement-slideshow";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import { typography } from "@/lib/typography";
import type { IAchievement, ISkillGroup } from "@/lib/db/models/SiteConfig";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AboutSectionProps {
  heading: string;
  bio: string;
  bullets: string[];
  achievements: IAchievement[];
  skills: ISkillGroup[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutSection({
  heading,
  bio,
  bullets,
  achievements,
  skills,
}: AboutSectionProps) {
  const aboutHeading = heading.trim() || "Full-Stack Developer";
  const bioParagraphs = bio
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasAchievements = achievements.length > 0;

  return (
    <SectionWrapper id="about" className="py-24 px-6 bg-transparent">
      <div className="mx-auto max-w-6xl">

        {/* Section heading */}
        <SectionItem>
          <p className={`mb-2 ${typography.sectionEyebrow}`}>About Me</p>
          <h2 className={typography.sectionTitle}>{aboutHeading}</h2>
        </SectionItem>

        {/* Two-column: bio left, achievement card right */}
        <div className={`mt-12 grid gap-10 ${hasAchievements ? "lg:grid-cols-2" : ""}`}>

          {/* Bio */}
          <SectionItem>
            <div className="space-y-5 text-base leading-8 text-platinum sm:text-lg">
              {bioParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              {bullets.length > 0 && (
                <ul className="space-y-2 pl-5 text-platinum marker:text-orangeWeb">
                  {bullets.map((bullet, i) => (
                    <li key={`${bullet}-${i}`}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </SectionItem>

          {/* Achievement highlight card */}
          {hasAchievements && (
            <SectionItem>
              <AchievementSlideshow achievements={achievements} />
            </SectionItem>
          )}
        </div>

        {/* Skills grid */}
        {skills.length > 0 && (
          <div className="mt-16">
            <SectionItem>
              <p className={`mb-8 ${typography.sectionEyebrow}`}>Technical Skills</p>
            </SectionItem>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((group) => (
                <SectionItem key={group.category}>
                  <div className="rounded-lg bg-oxfordBlue p-5 h-full">
                    <h4 className={`${typography.smallEyebrow} mb-4`}>{group.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-platinum/15 bg-black px-3 py-1.5 text-sm text-platinum"
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
