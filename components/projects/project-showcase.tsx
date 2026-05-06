"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IProject } from "@/lib/db/models/Project";
import ProjectCard from "./project-card";

interface ProjectShowcaseProps {
  projects: IProject[];
}

function chunkProjects(items: IProject[], chunkSize: number): IProject[][] {
  const chunks: IProject[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export default function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const [cardsPerSlide, setCardsPerSlide] = useState(1);
  const slides = useMemo(
    () => chunkProjects(projects, cardsPerSlide),
    [projects, cardsPerSlide]
  );
  const hasMultiple = slides.length > 1;
  const autoplay = useRef(
    Autoplay({
      delay: 7000,
      playOnInit: hasMultiple,
      stopOnFocusIn: true,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: hasMultiple, align: "start" },
    hasMultiple ? [autoplay.current] : []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(hasMultiple);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const updateCardsPerSlide = (matches: boolean) => {
      setCardsPerSlide(matches ? 3 : 1);
    };

    updateCardsPerSlide(desktopQuery.matches);
    const onChange = (event: MediaQueryListEvent) => {
      updateCardsPerSlide(event.matches);
    };

    desktopQuery.addEventListener("change", onChange);

    return () => {
      desktopQuery.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(0);
    setSelectedIndex(0);
  }, [cardsPerSlide, emblaApi]);

  const toggleAutoplay = () => {
    if (!hasMultiple) return;
    const plugin = autoplay.current;
    if (plugin.isPlaying()) {
      plugin.stop();
      setIsAutoplayRunning(false);
      return;
    }

    plugin.play();
    setIsAutoplayRunning(true);
  };

  return (
    <div className="mt-12 rounded-xl border border-platinum/10 bg-black/40 p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm text-platinum/70">
          Featured project showcase
        </p>
        <div className="flex items-center gap-3">
          <p className="shrink-0 text-sm text-platinum/70">
            {String(selectedIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
          {hasMultiple ? (
            <button
              type="button"
              onClick={toggleAutoplay}
              className="inline-flex items-center gap-1 rounded-md border border-platinum/20 bg-black/50 px-2.5 py-1 text-xs text-platinum transition-colors hover:border-orangeWeb/40 hover:text-orangeWeb"
              aria-label={isAutoplayRunning ? "Pause autoplay" : "Play autoplay"}
            >
              {isAutoplayRunning ? (
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isAutoplayRunning ? "Pause" : "Play"}
            </button>
          ) : null}
        </div>
      </div>
      <p className="mb-4 text-xs text-platinum/55 lg:text-sm lg:text-platinum/65">
        Auto-rotates every few seconds, and pauses when you interact. Desktop shows three projects per slide.
      </p>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {slides.map((slide, slideIndex) => (
              <div
                key={`project-slide-${slideIndex}`}
                className="min-w-0 flex-[0_0_100%] px-1"
              >
                <div className="grid gap-3 lg:grid-cols-3">
                  {slide.map((project) => (
                    <ProjectCard
                      key={project._id ? String(project._id) : project.title}
                      project={project}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-platinum/15 bg-black/70 text-white transition-colors hover:border-orangeWeb/40 hover:text-orangeWeb"
              aria-label="Previous project"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-platinum/15 bg-black/70 text-white transition-colors hover:border-orangeWeb/40 hover:text-orangeWeb"
              aria-label="Next project"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="mt-5 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={`project-dot-${index}`}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === selectedIndex
                  ? "bg-orangeWeb"
                  : "bg-platinum/30 hover:bg-platinum/50"
              }`}
              aria-label={`Go to project slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}