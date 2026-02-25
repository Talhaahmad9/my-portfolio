import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/config";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";

// ─── Footer / Contact ─────────────────────────────────────────────────────────

const socialLinks = [
  { label: "GitHub",   href: GITHUB_URL,   external: true  },
  { label: "LinkedIn", href: LINKEDIN_URL, external: true  },
  { label: "Email",    href: `mailto:${EMAIL}`, external: false },
];

export default function Footer() {
  return (
    <SectionWrapper
      id="contact"
      className="bg-oxfordBlue py-20 px-6"
    >
      <div className="mx-auto max-w-2xl text-center">
        <SectionItem>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Let&apos;s work together
          </h2>
        </SectionItem>

        <SectionItem>
          <p className="mt-4 text-platinum">
            Open to freelance contracts, full-time roles, and interesting
            collaborations in AI and web engineering.
          </p>
        </SectionItem>

        <SectionItem>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-orangeWeb px-8 py-3 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
          >
            Get In Touch
          </a>
        </SectionItem>

        {/* Social row */}
        <SectionItem>
          <nav className="mt-10 flex items-center justify-center gap-8">
            {socialLinks.map(({ label, href, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-sm text-platinum hover:text-orangeWeb transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </SectionItem>

        {/* Copyright */}
        <SectionItem>
          <p className="mt-12 text-xs text-platinum/50">
            © {new Date().getFullYear()} Talha Ahmad. Built with Next.js &amp;
            Tailwind CSS.
          </p>
        </SectionItem>
      </div>
    </SectionWrapper>
  );
}
