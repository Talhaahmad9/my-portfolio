"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Link2, Trophy } from "lucide-react";
import type { PublicAchievementHighlight, PublicEducationHighlight } from "@/lib/public/achievement-highlights";

interface AchievementExplorerProps {
  achievements: PublicAchievementHighlight[];
  education?: PublicEducationHighlight;
}

export default function AchievementExplorer({
  achievements,
  education,
}: AchievementExplorerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileExpandedIndex, setMobileExpandedIndex] = useState<number | null>(0);

  if (achievements.length === 0) return null;

  const current = achievements[selectedIndex] || achievements[0]!;

  // Canonical Education values
  const educationInstitution =
    education?.institution || "BS Computer Science — IoBM, Karachi";
  const educationPeriod =
    education?.periodText || "Expected 2027";

  return (
    <div className="rounded-xl border border-platinum/10 bg-[#0d1117]/80 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Explorer Top Header Bar */}
      <div className="flex items-center justify-between border-b border-platinum/10 px-5 py-3 bg-black/40 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-orangeWeb" />
          <span className="font-semibold text-orangeWeb tracking-wider uppercase">
            RECOGNITION / SELECT RECORD
          </span>
        </div>
        <span className="text-platinum/40 uppercase text-[10px] tracking-widest hidden sm:inline">
          INTERACTIVE DOSSIER
        </span>
      </div>

      {/* ─── DESKTOP EXPLORER (md:flex) ────────────────────────────────────────── */}
      <div className="hidden md:flex min-h-[340px]">
        {/* Left Column: Selector Rail */}
        <div className="w-5/12 border-r border-platinum/10 bg-black/20 flex flex-col justify-between">
          <div className="divide-y divide-platinum/5" role="tablist" aria-label="Achievement Records">
            {achievements.map((item, index) => {
              const isSelected = index === selectedIndex;
              const placeText = item.place;

              return (
                <button
                  key={`${item.title}-${item.event}-${index}`}
                  role="tab"
                  id={`tab-achievement-${index}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-achievement-${index}`}
                  tabIndex={0}
                  onClick={() => setSelectedIndex(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onFocus={() => setSelectedIndex(index)}
                  className={`w-full text-left p-4 text-xs transition-all relative group flex items-start gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orangeWeb ${
                    isSelected
                      ? "bg-oxfordBlue/40 text-white"
                      : "text-platinum/70 hover:bg-oxfordBlue/10 hover:text-platinum"
                  }`}
                >
                  {/* Selection Track Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeTrack"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-orangeWeb"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}

                  {/* Index badge */}
                  <span
                    className={`font-mono text-xs font-bold transition-colors ${
                      isSelected ? "text-orangeWeb" : "text-platinum/40 group-hover:text-platinum/70"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Info preview */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className={`font-semibold line-clamp-1 leading-snug transition-colors ${
                      isSelected ? "text-white" : "text-platinum/90"
                    }`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-platinum/60 truncate font-mono">
                      {item.event}
                    </p>
                    {placeText && (
                      <span className="inline-block text-[10px] font-mono font-medium text-orangeWeb/90 border border-orangeWeb/20 bg-orangeWeb/5 px-1.5 py-0.5 rounded mt-0.5">
                        {placeText}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detail Panel */}
        <div className="w-7/12 p-6 flex flex-col justify-between bg-oxfordBlue/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              id={`panel-achievement-${selectedIndex}`}
              role="tabpanel"
              aria-labelledby={`tab-achievement-${selectedIndex}`}
              className="space-y-4"
            >
              {/* Event / Org eyebrow */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-orangeWeb font-medium">
                  {current.event}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white leading-snug tracking-tight">
                {current.title}
              </h3>

              {/* Proof Signals (Place + Score) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                {current.place && (
                  <div className="flex items-center gap-1.5 rounded-md border border-orangeWeb/30 bg-orangeWeb/10 px-2.5 py-1 text-orangeWeb font-semibold">
                    <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{current.place}</span>
                  </div>
                )}

                {current.score && (
                  <div className="rounded-md border border-platinum/15 bg-black/40 px-2.5 py-1 text-platinum/90 font-medium">
                    Score: <span className="text-white font-semibold">{current.score}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {current.description && (
                <p className="text-xs leading-relaxed text-platinum/85 pt-1">
                  {current.description}
                </p>
              )}

              {/* Tech Stack */}
              {current.stack && current.stack.length > 0 && (
                <div className="pt-2">
                  <p className="font-mono text-[10px] text-platinum/50 uppercase tracking-wider mb-2">
                    Technologies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {current.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-platinum/15 bg-black/60 px-2 py-0.5 font-mono text-[11px] text-platinum/90"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(current.liveUrl || current.githubUrl) && (
                <div className="pt-3 flex items-center gap-4 border-t border-platinum/10">
                  {current.liveUrl && (
                    <a
                      href={current.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-orangeWeb hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Live Demo ↗
                    </a>
                  )}
                  {current.githubUrl && (
                    <a
                      href={current.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-platinum hover:text-white"
                    >
                      <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Repository ↗
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── MOBILE ACCORDION (md:hidden) ────────────────────────────────────── */}
      <div className="md:hidden divide-y divide-platinum/10 bg-black/20">
        {achievements.map((item, index) => {
          const isOpen = mobileExpandedIndex === index;
          const placeText = item.place;

          return (
            <div key={`${item.title}-mobile-${index}`} className="transition-colors">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`accordion-body-${index}`}
                onClick={() => setMobileExpandedIndex(isOpen ? null : index)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-orangeWeb"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-orangeWeb">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-platinum/60 truncate font-mono">
                      {item.event}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {placeText && (
                    <span className="text-[10px] font-mono font-medium text-orangeWeb border border-orangeWeb/30 bg-orangeWeb/10 px-2 py-0.5 rounded">
                      {placeText}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-platinum/60 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-orangeWeb" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`accordion-body-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden bg-oxfordBlue/20 px-5 pb-5 pt-1 space-y-3"
                  >
                    {/* Score */}
                    {item.score && (
                      <div className="font-mono text-xs text-platinum/80">
                        Score: <span className="text-white font-semibold">{item.score}</span>
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs leading-relaxed text-platinum/85">
                        {item.description}
                      </p>
                    )}

                    {/* Tech Stack */}
                    {item.stack && item.stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded border border-platinum/15 bg-black/60 px-2 py-0.5 font-mono text-[10px] text-platinum/90"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    {(item.liveUrl || item.githubUrl) && (
                      <div className="pt-2 flex items-center gap-4 border-t border-platinum/10 text-xs font-mono">
                        {item.liveUrl && (
                          <a
                            href={item.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-orangeWeb hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            Live Demo ↗
                          </a>
                        )}
                        {item.githubUrl && (
                          <a
                            href={item.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-platinum hover:text-white"
                          >
                            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Repository ↗
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ─── QUIET EDUCATION FOOTER STRIP ────────────────────────────────────── */}
      <div className="border-t border-platinum/10 bg-black/50 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-platinum/40 uppercase text-[10px] tracking-wider font-semibold">
            ACADEMIC FOUNDATION
          </span>
          <span className="text-platinum/30 hidden sm:inline">•</span>
          <span className="text-platinum/90 font-medium">{educationInstitution}</span>
        </div>
        <span className="text-orangeWeb/80 text-[11px]">{educationPeriod}</span>
      </div>
    </div>
  );
}
