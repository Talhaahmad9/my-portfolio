import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import { typography } from "@/lib/typography";
import type { PublicRole, PublicEducation } from "@/lib/public/experience";
import { Briefcase, GraduationCap, Calendar, MapPin } from "lucide-react";

interface ExperienceSectionProps {
  roles: PublicRole[];
  education: PublicEducation[];
}

export default function ExperienceSection({ roles, education }: ExperienceSectionProps) {
  if (roles.length === 0 && education.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="experience" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}
        <SectionItem>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-orangeWeb tracking-widest uppercase">
              01 // EXPERIENCE
            </span>
          </div>
          <h2 className={typography.sectionTitle}>Career History & Education</h2>
          <p className={`mt-3 max-w-2xl ${typography.sectionDescription}`}>
            Structured engineering roles, leadership milestones, and academic foundation.
          </p>
        </SectionItem>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* Left Column: Experience (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-platinum/10 pb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-orangeWeb flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                PROFESSIONAL ROLES & LEADERSHIP
              </h3>
              <span className="font-mono text-[10px] text-platinum/40">{roles.length} RECORD(S)</span>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-orangeWeb before:via-oxfordBlue before:to-platinum/10">
              {roles.map((role) => (
                <SectionItem key={role.id}>
                  <article className="relative rounded-xl border border-platinum/15 bg-black/60 p-6 backdrop-blur-sm transition-colors hover:border-orangeWeb/40">
                    {/* Node pin */}
                    <span className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-black bg-orangeWeb shadow-[0_0_8px_rgba(252,163,17,0.8)]" />

                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-semibold text-white">{role.roleTitle}</h4>
                        <p className="text-sm font-medium text-orangeWeb">{role.organization}</p>
                      </div>
                      {role.periodText && (
                        <span className="inline-flex items-center gap-1.5 rounded border border-orangeWeb/30 bg-orangeWeb/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-orangeWeb">
                          <Calendar className="h-3 w-3" />
                          {role.periodText}
                        </span>
                      )}
                    </div>

                    {role.location && (
                      <div className="mt-2 flex items-center gap-1 font-mono text-[11px] text-platinum/60">
                        <MapPin className="h-3 w-3 text-platinum/40" />
                        <span>{role.location}</span>
                      </div>
                    )}

                    {role.summary && (
                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-platinum/90">
                        {role.summary}
                      </p>
                    )}

                    {role.highlights && role.highlights.length > 0 && (
                      <ul className="mt-3 space-y-1.5 pl-4 text-xs sm:text-sm text-platinum/80 marker:text-orangeWeb">
                        {role.highlights.map((highlight, idx) => (
                          <li key={idx} className="list-disc leading-relaxed">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </SectionItem>
              ))}
            </div>
          </div>

          {/* Right Column: Education (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-platinum/10 pb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-orangeWeb flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                ACADEMIC FOUNDATION
              </h3>
              <span className="font-mono text-[10px] text-platinum/40">{education.length} RECORD(S)</span>
            </div>

            <div className="space-y-6">
              {education.map((edu) => (
                <SectionItem key={edu.id}>
                  <article className="rounded-xl border border-platinum/15 bg-black/60 p-6 backdrop-blur-sm transition-colors hover:border-orangeWeb/40">
                    <h4 className="text-base font-semibold text-white">{edu.degree}</h4>
                    <p className="text-sm font-medium text-orangeWeb mt-0.5">{edu.institution}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {edu.periodText && (
                        <span className="inline-flex items-center gap-1.5 rounded border border-orangeWeb/30 bg-orangeWeb/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-orangeWeb">
                          <Calendar className="h-3 w-3" />
                          {edu.periodText}
                        </span>
                      )}
                      {edu.location && (
                        <div className="flex items-center gap-1 font-mono text-[11px] text-platinum/60">
                          <MapPin className="h-3 w-3 text-platinum/40" />
                          <span>{edu.location}</span>
                        </div>
                      )}
                    </div>

                    {edu.summary && (
                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-platinum/90">
                        {edu.summary}
                      </p>
                    )}

                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul className="mt-3 space-y-1.5 pl-4 text-xs sm:text-sm text-platinum/80 marker:text-orangeWeb">
                        {edu.highlights.map((highlight, idx) => (
                          <li key={idx} className="list-disc leading-relaxed">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </SectionItem>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
