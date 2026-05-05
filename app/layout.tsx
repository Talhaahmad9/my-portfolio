import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/shared/page-transition";
import BackToTop from "@/components/shared/back-to-top";
import CursorGlow from "@/components/shared/cursor-glow";
import ParticleNetwork from "@/components/hero/particle-network";

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

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Talha Ahmad | Full Stack Developer & GenAI Specialist",
  description:
    "Full Stack Developer and GenAI Specialist building high-performance web applications and production-grade AI systems.",
  metadataBase: new URL("https://talhaahmad.me"),
  verification: {
    google: "76_987pdZ9u8OKA3pi0fkXpOklT-QRGBv0msa2sQ8VY",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://talhaahmad.me",
    siteName: "Talha Ahmad",
    title: "Talha Ahmad | Full Stack Developer & GenAI Specialist",
    description:
      "Full Stack Developer and GenAI Specialist building high-performance web applications and production-grade AI systems.",
    images: [
      {
        url: "/og-image.JPG",
        width: 1200,
        height: 630,
        alt: "Talha Ahmad — Full Stack Developer & GenAI Specialist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talha Ahmad | Full Stack Developer & GenAI Specialist",
    description:
      "Full Stack Developer and GenAI Specialist building high-performance web applications and production-grade AI systems.",
    images: ["/og-image.JPG"],
  },
};

// ─── Schema.org / JSON-LD ─────────────────────────────────────────────────────
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Talha Ahmad",
  jobTitle: "Full Stack Developer & GenAI Specialist",
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
        <ParticleNetwork fullscreen className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-65" />
        <CursorGlow />
        <PageTransition>{children}</PageTransition>
        <BackToTop />
      </body>
    </html>
  );
}
