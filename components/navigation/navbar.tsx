"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/config";
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
  return (
    <motion.header
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 inset-x-0 z-50 border-b border-oxfordBlue bg-black"
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
                className="text-sm text-platinum hover:text-orangeWeb transition-colors"
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
            className="text-sm text-platinum hover:text-orangeWeb transition-colors"
          >
            GitHub
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-platinum hover:text-orangeWeb transition-colors"
          >
            LinkedIn
          </a>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="rounded-md bg-orangeWeb px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
            >
              CV ↓
            </a>
          )}
        </div>

        {/* Mobile: hamburger (renders its own drawer) */}
        <MobileMenu resumeUrl={resumeUrl} />
      </nav>
    </motion.header>
  );
}
