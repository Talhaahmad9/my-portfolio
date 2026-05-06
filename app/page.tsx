// Server Component — no "use client" directive here.
import Navbar        from "@/components/navigation/navbar";
import HeroSection   from "@/components/hero/hero-section";
import AboutSection  from "@/components/about/about-section";
import CertificationsSection from "@/components/about/certifications-section";
import ProjectGrid   from "@/components/projects/project-grid";
import WinsSection   from "@/components/wins/wins-section";
import Footer        from "@/components/contact/footer";

import { getProjects } from "@/actions/projects";
import { getWins } from "@/actions/wins";
import { getActiveResume } from "@/actions/resume";
import { getSiteConfig } from "@/actions/config";

export default async function Home() {
  const projects = await getProjects();
  const wins = await getWins();
  const activeResume = await getActiveResume();
  const resumeUrl = activeResume?.fileUrl ?? null;
  const siteConfig = await getSiteConfig();

  return (
    <>
      <Navbar resumeUrl={resumeUrl} />
      <main>
        <HeroSection
          resumeUrl={resumeUrl}
          tagline={siteConfig.hero.tagline}
          typewriterStrings={siteConfig.hero.typewriterStrings}
        />
        <AboutSection
          heading={siteConfig.about.heading}
          bio={siteConfig.about.bio}
          bullets={siteConfig.about.bullets}
          achievements={siteConfig.about.achievements}
          skills={siteConfig.about.skills}
        />
        <ProjectGrid projects={projects} />
        <CertificationsSection certifications={siteConfig.about.certifications} />
        <WinsSection wins={wins} />
        <Footer />
      </main>
    </>
  );
}
