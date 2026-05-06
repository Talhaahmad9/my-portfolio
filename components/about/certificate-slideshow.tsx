"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { typography } from "@/lib/typography";
import type { ICertification } from "@/lib/db/models/SiteConfig";

interface CertificateSlideshowProps {
  certifications: ICertification[];
}

function CertificateCard({ certification }: { certification: ICertification }) {
  if (certification.publicId && certification.imageUrl) {
    return (
      <Link
        href={`/certificates/${certification.publicId}`}
        className="group overflow-hidden rounded-lg border border-platinum/10 bg-oxfordBlue transition-colors hover:border-orangeWeb/40"
      >
        <div className="relative aspect-4/3 overflow-hidden border-b border-platinum/10 bg-black/40">
          <Image
            src={certification.imageUrl}
            alt={certification.name}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="space-y-2 px-4 py-4">
          <p className="text-base font-medium text-white">{certification.name}</p>
          <p className="text-sm text-platinum">{certification.issuer}</p>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-orangeWeb">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            View Certificate
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-platinum/10 bg-oxfordBlue px-4 py-4">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orangeWeb" aria-hidden="true" />
      <p className="text-base text-platinum">
        {certification.name} - {certification.issuer}
      </p>
    </div>
  );
}

export default function CertificateSlideshow({
  certifications,
}: CertificateSlideshowProps) {
  const hasMultiple = certifications.length > 1;
  const autoplay = useRef(
    Autoplay({
      delay: 9000,
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

  if (certifications.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-orangeWeb/30 bg-oxfordBlue p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`${typography.smallEyebrow} mb-2`}>Certificates</p>
          <p className="text-sm text-platinum/70">
            Slow auto-play with manual controls.
          </p>
        </div>
        <p className="shrink-0 text-sm text-platinum/70">
          {String(selectedIndex + 1).padStart(2, "0")} / {String(certifications.length).padStart(2, "0")}
        </p>
      </div>

      <div className="relative mt-6">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {certifications.map((certification) => (
              <div
                key={certification.publicId ?? `${certification.name}-${certification.issuer}`}
                className="min-w-0 flex-[0_0_100%]"
              >
                <CertificateCard certification={certification} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-platinum/15 bg-black/55 text-white transition-colors hover:border-orangeWeb/40 hover:text-orangeWeb"
          aria-label="Previous certificate"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-platinum/15 bg-black/55 text-white transition-colors hover:border-orangeWeb/40 hover:text-orangeWeb"
          aria-label="Next certificate"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {certifications.map((certification, index) => (
          <button
            key={`${certification.publicId ?? certification.name}-dot-${index}`}
            type="button"
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === selectedIndex
                ? "bg-orangeWeb"
                : "bg-platinum/30 hover:bg-platinum/50"
            }`}
            aria-label={`Go to certificate ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}