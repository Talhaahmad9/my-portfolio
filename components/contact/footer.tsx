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

interface FooterProps {
  email?: string;
  socials?: Array<{ platform: string; url: string; label?: string }>;
  copyrightText?: string;
}

export default function Footer({ email = EMAIL, socials, copyrightText }: FooterProps) {
  const activeEmail = email || EMAIL;
  const currentYear = new Date().getFullYear();

  const renderedSocials = socials && socials.length > 0
    ? socials.map((s) => {
        const platformLower = s.platform.toLowerCase();
        let icon = Mail;
        if (platformLower.includes("github")) icon = FolderGit2;
        else if (platformLower.includes("linkedin")) icon = BriefcaseBusiness;
        const isExternal = s.url.startsWith("http");
        return {
          label: s.label || s.platform,
          href: s.url,
          external: isExternal,
          icon,
        };
      })
    : socialLinks;

  return (
    <SectionWrapper
      id="contact"
      className="relative border-t border-platinum/10 bg-black/60 py-20 px-4 sm:px-6 lg:px-8 backdrop-blur-md"
    >
      <div className="mx-auto max-w-2xl text-center">
        <SectionItem>
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="font-mono text-xs font-semibold text-orangeWeb tracking-widest uppercase">
              06 // CONTACT
            </span>
          </div>
          <h2 className={typography.sectionTitle}>
            Initiate Connection
          </h2>
        </SectionItem>

        <SectionItem>
          <p className={`mt-4 ${typography.sectionDescription}`}>
            Open to engineering roles, AI system contracts, and technical collaborations.
          </p>
        </SectionItem>

        <SectionItem>
          <a
            href={`mailto:${activeEmail}`}
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
            {renderedSocials.map(({ label, href, external, icon: Icon }) => (
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
            {copyrightText ? copyrightText : `© ${currentYear} Talha Ahmad. Built with Next.js & Tailwind CSS.`}
          </p>
        </SectionItem>
      </div>
    </SectionWrapper>
  );
}
