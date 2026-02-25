// Server Component — no "use client" directive here.
import Navbar        from "@/components/navigation/navbar";
import HeroSection   from "@/components/hero/hero-section";
import AboutSection  from "@/components/about/about-section";
import ProjectGrid   from "@/components/projects/project-grid";
import Footer        from "@/components/contact/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectGrid />
        <Footer />
      </main>
    </>
  );
}
