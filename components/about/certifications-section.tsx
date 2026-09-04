import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import CertificateSlideshow from "@/components/about/certificate-slideshow";
import SectionWrapper, { SectionItem } from "@/components/shared/section-wrapper";
import { typography } from "@/lib/typography";
import type { PublicCertification } from "@/lib/public/certifications";

export interface CertItem {
  publicId?: string;
  name: string;
  issuer: string;
  imageUrl?: string;
  mediaUrl?: string;
}

interface CertificationsSectionProps {
  certifications: (PublicCertification | CertItem)[];
}

export default function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  const useCertificateSlideshow = certifications.length > 3;

  if (certifications.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="certifications" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="mx-auto max-w-6xl">
        <SectionItem>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-orangeWeb tracking-widest uppercase">
              05 // CERTIFICATIONS
            </span>
          </div>
          <h2 className={typography.sectionTitle}>
            Verified Training & Technical Credentials
          </h2>
        </SectionItem>

        <div className="mt-12">
          <SectionItem>
            {useCertificateSlideshow ? (
              <CertificateSlideshow certifications={certifications} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {certifications.map((cert) => {
                  const imageSrc = cert.mediaUrl || ("imageUrl" in cert ? cert.imageUrl : undefined);
                  return cert.publicId && imageSrc ? (
                    <Link
                      key={cert.publicId}
                      href={`/certificates/${cert.publicId}`}
                      className="group overflow-hidden rounded-lg border border-platinum/10 bg-oxfordBlue transition-colors hover:border-orangeWeb/40"
                    >
                      <div className="relative aspect-4/3 overflow-hidden border-b border-platinum/10 bg-black/40">
                        <Image
                          src={imageSrc}
                          alt={cert.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="space-y-2 px-4 py-4">
                        <p className="text-base font-medium text-white">{cert.name}</p>
                        <p className="text-sm text-platinum">{cert.issuer}</p>
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-orangeWeb">
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          View Certificate
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={cert.publicId ?? cert.name}
                      className="flex items-start gap-3 rounded-lg border border-platinum/10 bg-oxfordBlue px-4 py-3"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orangeWeb" aria-hidden="true" />
                      <p className="text-base text-platinum">
                        {cert.name} — {cert.issuer}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionItem>
        </div>
      </div>
    </SectionWrapper>
  );
}