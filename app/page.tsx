// Server Component — no "use client" directive here.
import Navbar        from "@/components/navigation/navbar";
import HeroSection   from "@/components/hero/hero-section";
import AboutSection  from "@/components/about/about-section";
import CertificationsSection from "@/components/about/certifications-section";
import ProjectGrid   from "@/components/projects/project-grid";
import WinsSection   from "@/components/wins/wins-section";
import Footer        from "@/components/contact/footer";

import ExperienceSection from "@/components/experience/experience-section";

import { getActiveResume } from "@/actions/resume";
import { getCanonicalSiteSettings, getCanonicalSiteSeo } from "@/lib/public/site-settings";
import { getPublishedProjectsForPublic } from "@/lib/public/projects";
import { getPublishedAwardsForPublic } from "@/lib/public/awards";
import { getPublishedCertificationsForPublic } from "@/lib/public/certifications";
import { getPublishedSkillGroupsForPublic } from "@/lib/public/skills";
import { getPublicAboutHighlights } from "@/lib/public/achievement-highlights";
import { getPublicExperienceForPublic } from "@/lib/public/experience";

import SplashCursor from "@/components/effects/splash-cursor";

export default async function Home() {
  const projects = await getPublishedProjectsForPublic();
  const awards = await getPublishedAwardsForPublic();
  const certifications = await getPublishedCertificationsForPublic();
  const skillGroups = await getPublishedSkillGroupsForPublic();
  const aboutHighlights = await getPublicAboutHighlights();
  const experienceData = await getPublicExperienceForPublic();
  const activeResume = await getActiveResume();
  const resumeUrl = activeResume?.fileUrl ?? null;
  const resumeLabel = activeResume?.label ?? null;
  
  const siteContent = await getCanonicalSiteSettings();
  const siteSeo = await getCanonicalSiteSeo();

  const heroTypewriterStrings = [
    siteContent.hero.title,
    "Next.js Developer",
    "Frontend Developer",
    "Backend Developer",
  ].filter((s, i, a) => Boolean(s) && a.indexOf(s) === i);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://talhaahmad.me/#person",
        "name": siteContent.identity.fullName || "Talha Ahmad",
        "url": "https://talhaahmad.me",
        "jobTitle": siteContent.identity.headline,
        "sameAs": siteContent.socials.map((s) => s.url).filter(Boolean)
      },
      {
        "@type": "WebSite",
        "@id": "https://talhaahmad.me/#website",
        "url": "https://talhaahmad.me",
        "name": siteSeo.title,
        "publisher": {
          "@id": "https://talhaahmad.me/#person"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SplashCursor />
      <Navbar resumeUrl={resumeUrl} resumeLabel={resumeLabel} />
      <main>
        <HeroSection
          resumeUrl={resumeUrl}
          resumeLabel={resumeLabel}
          tagline={siteContent.hero.subtitle}
          typewriterStrings={heroTypewriterStrings}
          avatarUrl={siteContent.identity.avatarUrl}
          location={siteContent.identity.location}
          headline={siteContent.identity.headline}
          ctaPrimaryText={siteContent.hero.ctaPrimaryText}
          ctaPrimaryHref={siteContent.hero.ctaPrimaryHref}
          ctaSecondaryText={siteContent.hero.ctaSecondaryText}
          ctaSecondaryHref={siteContent.hero.ctaSecondaryHref}
        />
        <ExperienceSection roles={experienceData.roles} education={experienceData.education} />
        <AboutSection
          heading={siteContent.identity.headline}
          bioParagraphs={siteContent.about.bioParagraphs}
          corePillars={siteContent.about.corePillars}
          achievements={aboutHighlights.achievements}
          education={aboutHighlights.education}
          skills={skillGroups}
        />
        <ProjectGrid projects={projects} />
        <WinsSection wins={awards} />
        <CertificationsSection certifications={certifications} />
        <Footer
          email={siteContent.contact.email}
          socials={siteContent.socials}
          copyrightText={siteContent.footer.copyrightText}
        />
      </main>
    </>
  );
}
