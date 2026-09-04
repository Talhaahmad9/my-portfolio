"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import InlineLoader from "@/components/shared/InlineLoader";
import { getDownloadFilename } from "@/lib/getDownloadFilename";
import { downloadFile } from "@/utils/downloadFile";
import MobileMenu from "./mobile-menu";

const navLinks = [
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Recognition", href: "#wins" },
  { label: "Certificates", href: "#certifications" },
];

const navVariants: Variants = {
  hidden: { y: -24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function Navbar({
  resumeUrl,
  resumeLabel,
}: {
  resumeUrl: string | null;
  resumeLabel?: string | null;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

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
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? "border-b border-platinum/10 bg-[#0d1117]/90 backdrop-blur-md shadow-lg"
          : "border-b border-platinum/5 bg-[#0d1117]/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-18 sm:h-20">
        {/* LEFT: Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative rounded-md border border-platinum/15 bg-black/40 p-1 transition-colors group-hover:border-orangeWeb/60">
            <Image
              src="/logo.png"
              alt="Talha Ahmad logo"
              width={30}
              height={30}
              priority
              className="object-contain"
            />
          </div>
          <span className="text-base font-semibold text-white tracking-tight group-hover:text-platinum transition-colors">
            Talha Ahmad
          </span>
        </Link>

        {/* CENTER: Primary Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-[14px] font-medium text-platinum/75 transition-colors hover:text-orangeWeb relative py-1"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* RIGHT: Actions (CV + Resume) */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <Link
            href="/cv"
            className="text-[14px] font-medium text-platinum/80 transition-colors hover:text-orangeWeb py-1"
          >
            CV
          </Link>

          {resumeUrl && (
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
                }
              }}
              aria-busy={loadingDownload}
              className={`inline-flex items-center gap-1.5 rounded border border-orangeWeb/40 bg-orangeWeb/5 px-3 py-1.5 text-[13px] font-medium text-orangeWeb transition-all hover:bg-orangeWeb hover:text-black ${
                loadingDownload ? "opacity-80 pointer-events-none" : ""
              }`}
            >
              {loadingDownload ? (
                <InlineLoader size={14} />
              ) : (
                <>
                  <span>Resume</span>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </a>
          )}
        </div>

        {/* MOBILE: Hamburger */}
        <MobileMenu resumeUrl={resumeUrl} resumeLabel={resumeLabel} />
      </div>
    </motion.header>
  );
}
