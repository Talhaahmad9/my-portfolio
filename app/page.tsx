// Server Component — no "use client" directive here.
import Navbar        from "@/components/navigation/navbar";
import HeroSection   from "@/components/hero/hero-section";
import AboutSection  from "@/components/about/about-section";
import ProjectGrid   from "@/components/projects/project-grid";
import WinsSection   from "@/components/wins/wins-section";
import Footer        from "@/components/contact/footer";

import { getProjects } from "@/actions/projects";
import { getWins } from "@/actions/wins";
import { getActiveResume } from "@/actions/resume";

export default async function Home() {
  const projects = await getProjects();
  const wins = await getWins();
  const activeResume = await getActiveResume();
  const resumeUrl = activeResume?.fileUrl ?? null;

  return (
    <>
      <Navbar resumeUrl={resumeUrl} />
      <main>
        <HeroSection resumeUrl={resumeUrl} />
        <AboutSection />
        <WinsSection wins={wins} />
        <ProjectGrid projects={projects} />
        <Footer />
      </main>
    </>
  );
}
