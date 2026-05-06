import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import AchievementSlideshow from "@/components/about/achievement-slideshow";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import { typography } from "@/lib/typography";
import type { IAchievement, ICertification, ISkillGroup } from "@/lib/db/models/SiteConfig";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AboutSectionProps {
  bio: string;
  achievements: IAchievement[];
  skills: ISkillGroup[];
  certifications: ICertification[];
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
  const hasAchievements = achievements.length > 0;

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
        <div className={`mt-12 grid gap-10 ${hasAchievements ? "lg:grid-cols-2" : ""}`}>

          {/* Bio */}
          <SectionItem>
            <div className="space-y-5 text-base leading-8 text-platinum sm:text-lg">
              {bioParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
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

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mt-16">
            <SectionItem>
              <p className={`mb-6 ${typography.sectionEyebrow}`}>Certifications</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {certifications.map((cert) => (
                  cert.publicId && cert.imageUrl ? (
                    <Link
                      key={cert.publicId}
                      href={`/certificates/${cert.publicId}`}
                      className="group overflow-hidden rounded-lg border border-platinum/10 bg-oxfordBlue transition-colors hover:border-orangeWeb/40"
                    >
                      <div className="relative aspect-4/3 overflow-hidden border-b border-platinum/10 bg-black/40">
                        <Image
                          src={cert.imageUrl}
                          alt={cert.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="space-y-2 px-4 py-4">
                        <p className="text-base font-medium text-white">{cert.name}</p>
                        <p className="text-sm text-platinum">{cert.issuer}</p>
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-orangeWeb">
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          View Certificate
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={cert.publicId ?? cert.name}
                      className="flex items-start gap-3 rounded-lg border border-platinum/10 bg-oxfordBlue px-4 py-3"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orangeWeb" aria-hidden="true" />
                      <p className="text-base text-platinum">
                        {cert.name} — {cert.issuer}
                      </p>
                    </div>
                  )
                ))}
              </div>
            </SectionItem>
          </div>
        )}

      </div>
    </SectionWrapper>
  );
}
