import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { getCertificateByPublicId } from "@/actions/config";

interface CertificatePageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export async function generateMetadata({ params }: CertificatePageProps): Promise<Metadata> {
  const { publicId } = await params;
  const certificate = await getCertificateByPublicId(publicId);

  if (!certificate) {
    return {
      title: "Certificate Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${certificate.name} | Certificate`,
    description: `${certificate.name} issued by ${certificate.issuer}`,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: certificate.imageUrl
      ? {
          title: `${certificate.name} | Certificate`,
          description: `${certificate.name} issued by ${certificate.issuer}`,
          images: [
            {
              url: certificate.imageUrl,
              alt: certificate.name,
            },
          ],
        }
      : undefined,
  };
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { publicId } = await params;
  const certificate = await getCertificateByPublicId(publicId);

  if (!certificate) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#about"
          className="inline-flex items-center gap-2 text-sm text-platinum transition-colors hover:text-orangeWeb"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to About
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-platinum/10 bg-oxfordBlue/70 shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
            {certificate.imageUrl ? (
              <div className="relative aspect-4/3 w-full bg-black/40">
                <Image
                  src={certificate.imageUrl}
                  alt={certificate.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-4/3 items-center justify-center bg-black/40 px-6 text-center text-platinum/60">
                Certificate image unavailable.
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-platinum/10 bg-oxfordBlue/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-orangeWeb/80">
              Certificate
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
              {certificate.name}
            </h1>
            <p className="mt-3 text-base text-platinum">
              Issued by {certificate.issuer}
            </p>

            <div className="mt-6 rounded-xl border border-orangeWeb/20 bg-black/35 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-white">
                <ShieldCheck className="h-4 w-4 text-orangeWeb" aria-hidden="true" />
                Direct-link certificate page
              </p>
              <p className="mt-2 text-sm leading-6 text-platinum/80">
                This page is shareable by URL and intentionally excluded from search indexing.
              </p>
            </div>

            {certificate.imageUrl && (
              <a
                href={certificate.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-orangeWeb px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-orangeWeb/90"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open Full Image
              </a>
            )}

            <p className="mt-4 break-all text-xs text-platinum/55">
              Public ID: {certificate.publicId}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}