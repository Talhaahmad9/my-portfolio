import Image from "next/image";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import HeroActions from "./hero-actions";
import HeroTypewriter from "./hero-typewriter";
import { MapPin, FolderGit2, BriefcaseBusiness } from "lucide-react";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/config";

interface HeroSectionProps {
  resumeUrl: string | null;
  resumeLabel?: string | null;
  tagline: string;
  typewriterStrings: string[];
  avatarUrl?: string;
  location?: string;
  headline?: string;
  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
}

export default function HeroSection({
  resumeUrl,
  resumeLabel,
  tagline,
  typewriterStrings,
  avatarUrl = "/avatar.png",
  location = "Karachi, Pakistan",
  headline = "Full-Stack Developer",
  ctaPrimaryText,
  ctaPrimaryHref,
  ctaSecondaryText,
  ctaSecondaryHref,
}: HeroSectionProps) {
  return (
    <SectionWrapper
      id="hero"
      className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center px-4 py-20 sm:px-6 lg:px-8 bg-transparent"
    >
      {/* Subtle structural grid trace */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 mx-auto max-w-6xl w-full grid gap-10 lg:grid-cols-12 lg:items-center">
        
        {/* Left Column: Primary Hero Content (58%) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          <SectionItem>
            <div className="mb-4 inline-flex items-center gap-2 rounded border border-orangeWeb/30 bg-orangeWeb/10 px-3 py-1 font-mono text-xs font-semibold text-orangeWeb">
              <span className="h-2 w-2 rounded-full bg-orangeWeb animate-pulse" />
              <span>00 // OPERATIONAL PROFILE</span>
            </div>
          </SectionItem>

          <SectionItem>
            <HeroTypewriter strings={typewriterStrings} />
          </SectionItem>

          <SectionItem>
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-platinum/90">
              {tagline}
            </p>
          </SectionItem>

          <SectionItem>
            <HeroActions
              resumeUrl={resumeUrl}
              resumeLabel={resumeLabel}
              ctaPrimaryText={ctaPrimaryText}
              ctaPrimaryHref={ctaPrimaryHref}
              ctaSecondaryText={ctaSecondaryText}
              ctaSecondaryHref={ctaSecondaryHref}
            />
          </SectionItem>

        </div>

        {/* Right Column: Landscape Profile Module (42%) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <SectionItem>
            <div className="relative w-full max-w-[480px] rounded-2xl border border-oxfordBlue/80 bg-[#0d1117]/80 p-6 sm:p-7 backdrop-blur-xl shadow-2xl transition-colors hover:border-orangeWeb/30">
              
              {/* Module Header: Location Signal */}
              <div className="flex items-center justify-between border-b border-platinum/10 pb-4">
                <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-platinum/70">
                  <MapPin className="h-3.5 w-3.5 text-orangeWeb" aria-hidden="true" />
                  {location}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-platinum/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-orangeWeb" />
                  PROFILE
                </span>
              </div>

              {/* Center Profile Block: Landscape Layout */}
              <div className="my-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                {/* Focal Avatar */}
                <div className="relative shrink-0 rounded-full border border-orangeWeb/40 p-1 shadow-[0_0_20px_rgba(252,163,17,0.15)]">
                  <Image
                    src={avatarUrl || "/avatar.png"}
                    alt="Talha Ahmad"
                    width={105}
                    height={105}
                    priority
                    className="rounded-full object-cover"
                  />
                </div>

                {/* Identity Info */}
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-white tracking-tight">Talha Ahmad</h3>
                  <p className="text-sm font-medium text-orangeWeb">{headline}</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-platinum/70 hover:text-white transition-colors"
                    >
                      <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                      GitHub
                    </a>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-platinum/70 hover:text-white transition-colors"
                    >
                      <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* Technical Stack Footer Bar */}
              <div className="border-t border-platinum/10 pt-4 flex items-center justify-between font-mono text-[11px] text-platinum/60">
                <span className="text-platinum/40 uppercase tracking-wider">CORE FOCUS</span>
                <span className="text-platinum/80 font-medium">Full-Stack SaaS & AI Engineering</span>
              </div>

            </div>
          </SectionItem>
        </div>

      </div>
    </SectionWrapper>
  );
}
