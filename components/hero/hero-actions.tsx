"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download, FolderGit2, Mail } from "lucide-react";
import { EMAIL, GITHUB_URL } from "@/lib/config";

// ─── CTA Buttons (client island for hover animations) ─────────────────────────

export default function HeroActions({ resumeUrl }: { resumeUrl: string | null }) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <motion.a
        href={`mailto:${EMAIL}`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 rounded-md bg-orangeWeb px-6 py-3.5 text-base font-semibold text-black transition-opacity hover:opacity-90"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        Hire Me
      </motion.a>

      {resumeUrl && (
        <motion.a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-md border border-orangeWeb px-6 py-3.5 text-base font-semibold text-orangeWeb transition-colors hover:bg-orangeWeb hover:text-black"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download CV
        </motion.a>
      )}

      <motion.a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 rounded-md border border-platinum px-6 py-3.5 text-base font-semibold text-platinum transition-colors hover:border-orangeWeb hover:text-orangeWeb"
      >
        <FolderGit2 className="h-4 w-4" aria-hidden="true" />
        GitHub
      </motion.a>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link
          href="#projects"
          className="inline-flex items-center gap-2 text-base text-platinum underline-offset-4 hover:text-orangeWeb hover:underline"
        >
          View my work
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
