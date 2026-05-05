import Image from "next/image";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import HeroActions from "./hero-actions";
import ParticleNetwork from "./particle-network";

// ─── Hero Section (Server Component shell) ────────────────────────────────────
// Animated children are isolated in the "use client" HeroActions island.

export default function HeroSection({ resumeUrl }: { resumeUrl: string | null }) {
  return (
    <SectionWrapper
      id="hero"
      className="relative overflow-hidden flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center"
    >
      {/* Live particle network background — "use client" canvas island */}
      <ParticleNetwork />

      {/* Content sits above canvas */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Avatar */}
        <SectionItem>
          <div className="mb-8 inline-block rounded-full border-4 border-orangeWeb p-1 shadow-lg">
            <Image
              src="/avatar.png"
              alt="Talha Ahmad"
              width={120}
              height={120}
              priority
              className="rounded-full object-cover"
            />
          </div>
        </SectionItem>

        <SectionItem>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-orangeWeb">
            Full Stack Developer &amp; GenAI Specialist
          </p>
        </SectionItem>

        <SectionItem>
          <h1 className="text-5xl font-semibold leading-tight text-white sm:text-7xl">
            Talha Ahmad
          </h1>
        </SectionItem>

        <SectionItem>
          <p className="mt-6 max-w-2xl text-lg text-platinum">
            I build intelligent systems and high-performance web applications —
            from fine-tuned LLMs to production-ready Next.js products.
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
