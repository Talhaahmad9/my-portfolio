"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, Download, FolderGit2 } from "lucide-react";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/config";
import { typography } from "@/lib/typography";
import MobileMenu from "./mobile-menu";

const navLinks = [
  { label: "About",    href: "#about"    },
  { label: "Projects", href: "#projects" },
  { label: "Contact",  href: "#contact"  },
];

// ─── Animation ────────────────────────────────────────────────────────────────

const navVariants = {
  hidden: { y: -24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar({ resumeUrl }: { resumeUrl: string | null }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <motion.header
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-orangeWeb/10 bg-black/45 shadow-[0_12px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl"
          : "border-transparent bg-transparent shadow-none backdrop-blur-none"
      }`}
    >
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo image */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Talha Ahmad logo"
            width={36}
            height={36}
            priority
            className="object-contain"
          />
        </Link>

        {/* Nav links */}
        <ul className="hidden sm:flex items-center gap-8">
          {navLinks.map(({ label, href }, i) => (
            <motion.li
              key={href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            >
              <Link
                href={href}
                className={`${typography.navLink} font-medium`}
              >
                {label}
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Desktop: social links + CV button */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base text-platinum transition-colors hover:text-orangeWeb"
          >
            <FolderGit2 className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base text-platinum transition-colors hover:text-orangeWeb"
          >
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            LinkedIn
          </a>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-base font-semibold text-black transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              CV
            </a>
          )}
        </div>

        {/* Mobile: hamburger (renders its own drawer) */}
        <MobileMenu resumeUrl={resumeUrl} />
      </nav>
    </motion.header>
  );
}
