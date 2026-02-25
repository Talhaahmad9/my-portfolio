import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/shared/page-transition";
import BackToTop from "@/components/shared/back-to-top";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const geistSans = Geist({
  variable: "--font-geist-sans",
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
  title: "Talha Ahmad | AI Engineer & Next.js Developer",
  description:
    "AI Engineer and Next.js Developer specializing in building high-performance web applications and intelligent systems.",
  metadataBase: new URL("https://talhaahmad.vercel.app"),
  verification: {
    google: "76_987pdZ9u8OKA3pi0fkXpOklT-QRGBv0msa2sQ8VY",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://talhaahmad.vercel.app",
    siteName: "Talha Ahmad",
    title: "Talha Ahmad | AI Engineer & Next.js Developer",
    description:
      "AI Engineer and Next.js Developer specializing in building high-performance web applications and intelligent systems.",
    images: [
      {
        url: "/og-image.JPG",
        width: 1200,
        height: 630,
        alt: "Talha Ahmad — AI Engineer & Next.js Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talha Ahmad | AI Engineer & Next.js Developer",
    description:
      "AI Engineer and Next.js Developer specializing in building high-performance web applications and intelligent systems.",
    images: ["/og-image.JPG"],
  },
};

// ─── Schema.org / JSON-LD ─────────────────────────────────────────────────────
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Talha Ahmad",
  jobTitle: "AI Engineer",
  description: "Computer Science Student at IoBM",
  url: "https://talhaahmad.dev",
  sameAs: [
    "https://github.com/Talhaahmad9",
    "https://linkedin.com/in/talha-ahmad9",
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
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}
      >
        <PageTransition>{children}</PageTransition>
        <BackToTop />
      </body>
    </html>
  );
}
