"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Download, Menu, X } from "lucide-react";
import { getDownloadFilename } from "@/lib/getDownloadFilename";
import { downloadFile } from "@/utils/downloadFile";
import InlineLoader from "@/components/shared/InlineLoader";

const mobileNavLinks = [
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Recognition", href: "#wins" },
  { label: "Certificates", href: "#certifications" },
  { label: "CV", href: "/cv" },
];

const drawerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function MobileMenu({
  resumeUrl,
  resumeLabel,
}: {
  resumeUrl: string | null;
  resumeLabel?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger / Close toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-md text-platinum transition-colors hover:text-orangeWeb focus:outline-none"
      >
        <motion.div
          key={open ? "close" : "menu"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
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
            className="absolute inset-x-0 top-full border-b border-platinum/10 bg-[#0d1117]/95 px-6 py-6 shadow-2xl backdrop-blur-xl"
          >
            <ul className="flex flex-col space-y-1">
              {mobileNavLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-base font-medium text-platinum/90 transition-colors hover:text-orangeWeb min-h-[44px] flex items-center"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {resumeUrl && (
              <div className="mt-4 pt-4 border-t border-platinum/10">
                <a
                  href="/api/resume/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  download={getDownloadFilename(resumeLabel ?? null, resumeUrl)}
                  onClick={async (e) => {
                    e.preventDefault();
                    setLoadingDownload(true);
                    try {
                      await downloadFile(
                        "/api/resume/download",
                        getDownloadFilename(resumeLabel ?? null, resumeUrl)
                      );
                    } catch (err) {
                      console.error(err);
                      window.open("/api/resume/download", "_blank");
                      try {
                        alert("Download failed — opening in a new tab.");
                      } catch {}
                    } finally {
                      setLoadingDownload(false);
                      setOpen(false);
                    }
                  }}
                  aria-busy={loadingDownload}
                  className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded border border-orangeWeb/40 bg-orangeWeb/10 px-4 py-2.5 text-sm font-semibold text-orangeWeb transition-all hover:bg-orangeWeb hover:text-black ${
                    loadingDownload ? "opacity-80 pointer-events-none" : ""
                  }`}
                >
                  {loadingDownload ? (
                    <InlineLoader size={16} />
                  ) : (
                    <>
                      <span>Download Resume</span>
                      <Download className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
