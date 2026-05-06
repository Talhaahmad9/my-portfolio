"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Link2,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { typography } from "@/lib/typography";
import type { IAchievement } from "@/lib/db/models/SiteConfig";

interface AchievementSlideshowProps {
  achievements: IAchievement[];
}

function AchievementBody({ achievement }: { achievement: IAchievement }) {
  return (
    <div className="min-h-68">
      <h3 className={typography.cardTitle}>{achievement.title}</h3>
      <p className="mt-2 text-base text-platinum">{achievement.event}</p>

      <div className="mt-4 space-y-2 text-base text-platinum">
        {achievement.score && (
          <p>
            <span className="font-medium text-white">Score:</span>{" "}
            {achievement.score}
          </p>
        )}
        <p>
          <span className="font-medium text-white">Result:</span>{" "}
          {achievement.place}
        </p>
        {achievement.description && (
          <p>
            <span className="font-medium text-white">Project:</span>{" "}
            {achievement.description}
          </p>
        )}
      </div>

      {achievement.stack.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {achievement.stack.map((item) => (
            <span
              key={item}
              className="rounded-md border border-platinum/15 bg-black px-3 py-1.5 text-sm text-platinum"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {(achievement.liveUrl || achievement.githubUrl) && (
        <div className="mt-5 flex items-center gap-3">
          {achievement.liveUrl && (
            <a
              href={achievement.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-orangeWeb hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Live
            </a>
          )}
          {achievement.githubUrl && (
            <a
              href={achievement.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-platinum hover:text-white"
            >
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              GitHub
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function EducationFooter() {
  return (
    <div className="mt-6 border-t border-platinum/10 pt-6">
      <p className={`${typography.smallEyebrow} mb-3`}>Education</p>
      <p className="text-base font-medium text-white">
        BS Computer Science — IoBM, Karachi
      </p>
      <p className="mt-1 text-base text-platinum">
        Sep 2023 – Present · Expected 2027
      </p>
    </div>
  );
}

export default function AchievementSlideshow({
  achievements,
}: AchievementSlideshowProps) {
  const hasMultiple = achievements.length > 1;
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      playOnInit: hasMultiple,
      stopOnFocusIn: true,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: hasMultiple },
    hasMultiple ? [autoplay.current] : []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    updateSelectedIndex();
    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);
  }, [emblaApi]);

  if (achievements.length === 0) {
    return null;
  }

  if (!hasMultiple) {
    return (
      <div className="h-full rounded-lg border border-orangeWeb/30 bg-oxfordBlue p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full border border-orangeWeb/20 bg-orangeWeb/10 p-3 text-orangeWeb">
            <Trophy className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`${typography.smallEyebrow} mb-2`}>Achievement</p>
            <AchievementBody achievement={achievements[0]!} />
          </div>
        </div>
        <EducationFooter />
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg border border-orangeWeb/30 bg-oxfordBlue p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-full border border-orangeWeb/20 bg-orangeWeb/10 p-3 text-orangeWeb">
            <Trophy className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <p className={`${typography.smallEyebrow} mb-2`}>Achievements</p>
            <p className="text-sm text-platinum/70">
              Auto-playing highlights with manual controls.
            </p>
          </div>
        </div>
        <p className="shrink-0 text-sm text-platinum/70">
          {String(selectedIndex + 1).padStart(2, "0")} / {String(achievements.length).padStart(2, "0")}
        </p>
      </div>

      <div className="relative mt-6">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {achievements.map((achievement, index) => (
              <div
                key={`${achievement.title}-${achievement.event}-${index}`}
                className="min-w-0 flex-[0_0_100%]"
              >
                <AchievementBody achievement={achievement} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-platinum/15 bg-black/55 text-white transition-colors hover:border-orangeWeb/40 hover:text-orangeWeb"
          aria-label="Previous achievement"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-platinum/15 bg-black/55 text-white transition-colors hover:border-orangeWeb/40 hover:text-orangeWeb"
          aria-label="Next achievement"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {achievements.map((achievement, index) => (
          <button
            key={`${achievement.title}-dot-${index}`}
            type="button"
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === selectedIndex
                ? "bg-orangeWeb"
                : "bg-platinum/30 hover:bg-platinum/50"
            }`}
            aria-label={`Go to achievement ${index + 1}`}
          />
        ))}
      </div>

      <EducationFooter />
    </div>
  );
}