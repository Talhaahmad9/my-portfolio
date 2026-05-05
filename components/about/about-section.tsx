import { Check, ExternalLink, Link2, Trophy } from "lucide-react";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import { typography } from "@/lib/typography";
import type { IAchievement, ISkillGroup } from "@/lib/db/models/SiteConfig";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AboutSectionProps {
  bio: string;
  achievements: IAchievement[];
  skills: ISkillGroup[];
  certifications: { name: string; issuer: string }[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutSection({
  bio,
  achievements,
  skills,
  certifications,
}: AboutSectionProps) {
  const bioParagraphs = bio
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const primaryAchievement = achievements[0];

  return (
    <SectionWrapper id="about" className="py-24 px-6 bg-transparent">
      <div className="mx-auto max-w-6xl">

        {/* Section heading */}
        <SectionItem>
          <p className={`mb-2 ${typography.sectionEyebrow}`}>About Me</p>
          <h2 className={typography.sectionTitle}>
            Full Stack Developer &amp; GenAI Specialist
          </h2>
        </SectionItem>

        {/* Two-column: bio left, achievement card right */}
        <div className="mt-12 grid gap-10 lg:grid-cols-2">

          {/* Bio */}
          <SectionItem>
            <div className="space-y-5 text-base leading-8 text-platinum sm:text-lg">
              {bioParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </SectionItem>

          {/* Achievement highlight card */}
          {primaryAchievement && (
            <SectionItem>
              <div className="rounded-lg border border-orangeWeb/30 bg-oxfordBlue p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="rounded-full border border-orangeWeb/20 bg-orangeWeb/10 p-3 text-orangeWeb">
                    <Trophy className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${typography.smallEyebrow} mb-2`}>Recent Achievement</p>
                    <h3 className={typography.cardTitle}>{primaryAchievement.title}</h3>
                    <p className="mt-2 text-base text-platinum">{primaryAchievement.event}</p>

                    <div className="mt-4 space-y-2 text-base text-platinum">
                      {primaryAchievement.score && (
                        <p>
                          <span className="text-white font-medium">Score:</span>{" "}
                          {primaryAchievement.score}
                        </p>
                      )}
                      <p>
                        <span className="text-white font-medium">Result:</span>{" "}
                        {primaryAchievement.place}
                      </p>
                      {primaryAchievement.description && (
                        <p>
                          <span className="text-white font-medium">Project:</span>{" "}
                          {primaryAchievement.description}
                        </p>
                      )}
                      {primaryAchievement.stack.length > 0 && (
                        <p>
                          <span className="text-white font-medium">Stack:</span>{" "}
                          {primaryAchievement.stack.join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Optional links */}
                    {(primaryAchievement.liveUrl || primaryAchievement.githubUrl) && (
                      <div className="mt-4 flex items-center gap-3">
                        {primaryAchievement.liveUrl && (
                          <a
                            href={primaryAchievement.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-orangeWeb hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            Live
                          </a>
                        )}
                        {primaryAchievement.githubUrl && (
                          <a
                            href={primaryAchievement.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-platinum hover:text-white"
                          >
                            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                            GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="mt-6 pt-6 border-t border-platinum/10">
                  <p className={`${typography.smallEyebrow} mb-3`}>Education</p>
                  <p className="text-base font-medium text-white">
                    BS Computer Science — IoBM, Karachi
                  </p>
                  <p className="mt-1 text-base text-platinum">
                    Sep 2023 – Present · Expected 2027
                  </p>
                </div>
              </div>
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

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mt-16">
            <SectionItem>
              <p className={`mb-6 ${typography.sectionEyebrow}`}>Certifications</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="flex items-start gap-3 rounded-lg border border-platinum/10 bg-oxfordBlue px-4 py-3"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orangeWeb" aria-hidden="true" />
                    <p className="text-base text-platinum">
                      {cert.name} — {cert.issuer}
                    </p>
                  </div>
                ))}
              </div>
            </SectionItem>
          </div>
        )}

      </div>
    </SectionWrapper>
  );
}
