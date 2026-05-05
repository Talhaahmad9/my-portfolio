"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md text-platinum hover:text-orangeWeb transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orangeWeb"
      >
        <motion.span
          animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className="block h-0.5 w-5 bg-current origin-center"
        />
        <motion.span
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.15 }}
          className="block h-0.5 w-5 bg-current"
        />
        <motion.span
          animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className="block h-0.5 w-5 bg-current origin-center"
        />
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
            className="absolute inset-x-0 top-full border-b border-oxfordBlue bg-black px-6 py-5 shadow-lg"
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block text-base text-platinum hover:text-orangeWeb transition-colors py-1"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CV download in mobile menu too */}
            {resumeUrl && (
              <div className="mt-5 pt-5 border-t border-oxfordBlue">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
                >
                  Download CV ↓
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
