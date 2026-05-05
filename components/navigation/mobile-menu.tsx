"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Download, Menu, X } from "lucide-react";
import { typography } from "@/lib/typography";

const navLinks = [
  { label: "About",    href: "#about"    },
  { label: "Projects", href: "#projects" },
  { label: "Contact",  href: "#contact"  },
];

const drawerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -8 },
};

export default function MobileMenu({ resumeUrl }: { resumeUrl: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      {/* Hamburger / close button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md text-platinum transition-colors hover:text-orangeWeb focus:outline-none focus-visible:ring-2 focus-visible:ring-orangeWeb"
      >
        <motion.div
          key={open ? "close" : "menu"}
          initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 12 }}
          transition={{ duration: 0.18 }}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </motion.div>
      </button>

      {/* Slide-down drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full border-b border-orangeWeb/10 bg-black/80 px-6 py-5 shadow-2xl backdrop-blur-xl"
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block py-1 ${typography.navLink}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CV download in mobile menu too */}
            {resumeUrl && (
              <div className="mt-5 border-t border-oxfordBlue/70 pt-5">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2.5 text-base font-semibold text-black transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download CV
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
