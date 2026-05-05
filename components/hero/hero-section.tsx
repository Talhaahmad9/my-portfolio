import Image from "next/image";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import HeroActions from "./hero-actions";
import HeroTypewriter from "./hero-typewriter";

// ─── Hero Section (Server Component shell) ────────────────────────────────────
// Animated children are isolated in the "use client" HeroActions island.

interface HeroSectionProps {
  resumeUrl: string | null;
  tagline: string;
  typewriterStrings: string[];
}

export default function HeroSection({ resumeUrl, tagline, typewriterStrings }: HeroSectionProps) {
  return (
    <SectionWrapper
      id="hero"
      className="bg-transparent relative overflow-hidden flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center"
    >
      {/* Content sits above canvas */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Avatar */}
        <SectionItem>
          <div className="mb-8 inline-block rounded-full border-4 border-orangeWeb p-1 shadow-lg">
            <Image
              src="/avatar.png"
              alt="Talha Ahmad"
              width={140}
              height={140}
              priority
              className="rounded-full object-cover"
            />
          </div>
        </SectionItem>

        <SectionItem>
          <HeroTypewriter strings={typewriterStrings} />
        </SectionItem>

        <SectionItem>
          <p className="mt-6 max-w-2xl text-xl text-platinum">
            {tagline}
          </p>
        </SectionItem>

        <SectionItem>
          {/* Client island — handles hover / click animations */}
          <HeroActions resumeUrl={resumeUrl} />
        </SectionItem>

      </div>
    </SectionWrapper>
  );
}
