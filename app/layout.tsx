import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import PageTransition from "@/components/shared/page-transition";
import BackToTop from "@/components/shared/back-to-top";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const bodyFont = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

import { getCanonicalSiteSeo } from "@/lib/public/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  let seo: {
    title: string;
    description: string;
    ogImageUrl?: string;
    noIndex: boolean;
    canonicalUrl: string;
  } = {
    title: "Talha Ahmad | Full-Stack Developer",
    description: "Full-Stack Developer building high-performance web applications and production-grade AI systems.",
    ogImageUrl: "/avatar.png",
    noIndex: false,
    canonicalUrl: "https://talhaahmad.me",
  };

  try {
    seo = await getCanonicalSiteSeo();
  } catch (error) {
    console.error("Failed to load canonical SEO settings for root metadata:", error);
  }

  return {
    title: seo.title,
    description: seo.description,
    metadataBase: new URL(seo.canonicalUrl),
    alternates: {
      canonical: seo.canonicalUrl,
    },
    robots: seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    verification: {
      google: "76_987pdZ9u8OKA3pi0fkXpOklT-QRGBv0msa2sQ8VY",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: seo.canonicalUrl,
      siteName: "Talha Ahmad",
      title: seo.title,
      description: seo.description,
      images: seo.ogImageUrl
        ? [
            {
              url: seo.ogImageUrl,
              width: 1200,
              height: 630,
              alt: seo.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : [],
    },
  };
}

// ─── Schema.org / JSON-LD ─────────────────────────────────────────────────────
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Talha Ahmad",
  jobTitle: "Full Stack Developer",
  description: "Computer Science Student at IoBM",
  url: "https://talhaahmad.me",
  sameAs: [
    "https://github.com/Talhaahmad9",
    "https://linkedin.com/in/talha-ahmad9",
    "https://talhaahmad.me",
  ],
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body
        className={`${bodyFont.variable} ${headingFont.variable} ${geistMono.variable} relative overflow-x-hidden bg-[#0d1117] text-white antialiased`}
      >
        <PageTransition>{children}</PageTransition>
        <BackToTop />
        <Analytics />
      </body>
    </html>
  );
}
