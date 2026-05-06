"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ProjectCarouselProps {
  images: string[];
  title: string;
  imageFit?: "cover" | "contain";
}

function isSvgImage(url: string): boolean {
  const cleanUrl = url.split("?")[0]?.split("#")[0] ?? url;
  return cleanUrl.toLowerCase().endsWith(".svg");
}

export default function ProjectCarousel({ images, title, imageFit = "cover" }: ProjectCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full touch-pan-y">
          {images.map((img, index) => (
            <div key={index} className="relative h-full w-full flex-[0_0_100%] min-w-0">
              {isSvgImage(img) ? (
                <img
                  src={img}
                  alt={`${title} image ${index + 1}`}
                  className={`h-full w-full ${imageFit === "contain" ? "object-contain" : "object-cover"}`}
                />
              ) : (
                <Image
                  src={img}
                  alt={`${title} image ${index + 1}`}
                  fill
                  className={imageFit === "contain" ? "object-contain" : "object-cover"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); scrollPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-oxfordBlue/80 text-white transition-colors hover:bg-oxfordBlue z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); scrollNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-oxfordBlue/80 text-white transition-colors hover:bg-oxfordBlue z-10"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); emblaApi?.scrollTo(index); }}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === selectedIndex ? "bg-orangeWeb" : "bg-platinum/30 hover:bg-platinum/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
