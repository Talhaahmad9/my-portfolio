import { ArrowRight, BriefcaseBusiness, FolderGit2, Mail } from "lucide-react";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/config";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import { typography } from "@/lib/typography";

// ─── Footer / Contact ─────────────────────────────────────────────────────────

const socialLinks = [
  { label: "GitHub", href: GITHUB_URL, external: true, icon: FolderGit2 },
  { label: "LinkedIn", href: LINKEDIN_URL, external: true, icon: BriefcaseBusiness },
  { label: "Email", href: `mailto:${EMAIL}`, external: false, icon: Mail },
];

export default function Footer() {
  return (
    <SectionWrapper
      id="contact"
      className="relative border-t border-orangeWeb/10 bg-oxfordBlue/18 py-20 px-6 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-2xl text-center">
        <SectionItem>
          <h2 className={typography.sectionTitle}>
            Let&apos;s work together
          </h2>
        </SectionItem>

        <SectionItem>
          <p className={`mt-4 ${typography.sectionDescription}`}>
            Open to freelance contracts, full-time roles, and interesting
            collaborations in AI and web engineering.
          </p>
        </SectionItem>

        <SectionItem>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-orangeWeb px-8 py-3.5 text-base font-semibold text-black transition-opacity hover:opacity-90"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Get In Touch
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </SectionItem>

        {/* Social row */}
        <SectionItem>
          <nav className="mt-10 flex items-center justify-center gap-8">
            {socialLinks.map(({ label, href, external, icon: Icon }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex items-center gap-2 text-base text-platinum transition-colors hover:text-orangeWeb"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>
        </SectionItem>

        {/* Copyright */}
        <SectionItem>
          <p className="mt-12 text-sm text-platinum/50">
            © {new Date().getFullYear()} Talha Ahmad. Built with Next.js &amp;
            Tailwind CSS.
          </p>
        </SectionItem>
      </div>
    </SectionWrapper>
  );
}
