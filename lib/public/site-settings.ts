import { connectDB } from "@/lib/db/mongo";
import { SiteSettingsModel, ISiteSettings } from "@/lib/db/models/SiteSettings";

export interface PublicSocial {
  platform: string;
  url: string;
  label?: string;
  displayOrder: number;
}

export interface PublicSiteContent {
  identity: {
    fullName: string;
    headline: string;
    location: string;
    avatarUrl?: string;
    statusBadgeText?: string;
  };
  hero: {
    greeting: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryHref: string;
    ctaSecondaryText: string;
    ctaSecondaryHref: string;
  };
  about: {
    bioParagraphs: string[];
    corePillars: string[];
  };
  contact: {
    email: string;
    availabilityStatus?: string;
    preferredMethod?: string;
  };
  socials: PublicSocial[];
  footer: {
    copyrightText: string;
    tagline?: string;
  };
}

export async function getCanonicalSiteSettings(): Promise<PublicSiteContent> {
  await connectDB();

  const doc = (await SiteSettingsModel.findOne({ key: "main" }).lean()) as ISiteSettings | null;

  if (!doc) {
    throw new Error("Canonical SiteSettings singleton (key='main') is missing from the database.");
  }

  const rawSocials = doc.socials || [];
  const enabledSocials = rawSocials
    .filter((s) => s.enabled !== false && Boolean(s.url))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((s) => ({
      platform: s.platform,
      url: s.url,
      label: s.label || undefined,
      displayOrder: s.displayOrder ?? 0,
    }));

  return {
    identity: {
      fullName: doc.identity?.fullName || "Talha Ahmad",
      headline: doc.identity?.headline || "Full-Stack Developer",
      location: doc.identity?.location || "Karachi, Pakistan",
      avatarUrl: doc.identity?.avatarUrl || "/avatar.png",
      statusBadgeText: doc.identity?.statusBadgeText || undefined,
    },
    hero: {
      greeting: doc.hero?.greeting || "Hello, I'm",
      title: doc.hero?.title || "Full-Stack Developer",
      subtitle: doc.hero?.subtitle || "Full-Stack Developer building real products — from live SaaS to AI-powered systems.",
      ctaPrimaryText: doc.hero?.ctaPrimaryText || "Hire Me",
      ctaPrimaryHref: doc.hero?.ctaPrimaryHref || "mailto:hi.talhaahmad@gmail.com",
      ctaSecondaryText: doc.hero?.ctaSecondaryText || "View my work",
      ctaSecondaryHref: doc.hero?.ctaSecondaryHref || "#projects",
    },
    about: {
      bioParagraphs: doc.about?.bioParagraphs || [],
      corePillars: doc.about?.corePillars || [],
    },
    contact: {
      email: doc.contact?.email || "hi.talhaahmad@gmail.com",
      availabilityStatus: doc.contact?.availabilityStatus || undefined,
      preferredMethod: doc.contact?.preferredMethod || undefined,
    },
    socials: enabledSocials,
    footer: {
      copyrightText: doc.footer?.copyrightText || "Talha Ahmad. Built with Next.js & Tailwind CSS.",
      tagline: doc.footer?.tagline || undefined,
    },
  };
}

export interface PublicSiteSeo {
  title: string;
  description: string;
  ogImageUrl?: string;
  noIndex: boolean;
  canonicalUrl: string;
}

/**
 * Server-side helper to fetch canonical site SEO parameters with deterministic fallbacks.
 */
export async function getCanonicalSiteSeo(): Promise<PublicSiteSeo> {
  await connectDB();

  const doc = (await SiteSettingsModel.findOne({ key: "main" }).lean()) as ISiteSettings | null;

  const siteOrigin = "https://talhaahmad.me";

  const fullName = doc?.identity?.fullName || "Talha Ahmad";
  const headline = doc?.identity?.headline || "Full-Stack Developer";
  const heroSubtitle =
    doc?.hero?.subtitle ||
    "Full-Stack Developer building high-performance web applications and production-grade AI systems.";

  const title = doc?.seo?.title?.trim() || `${fullName} | ${headline}`;
  const description = doc?.seo?.description?.trim() || heroSubtitle;
  const ogImageUrl = doc?.seo?.ogImageUrl?.trim() || doc?.identity?.avatarUrl || "/avatar.png";
  const noIndex = Boolean(doc?.seo?.noIndex);

  return {
    title,
    description,
    ogImageUrl,
    noIndex,
    canonicalUrl: siteOrigin,
  };
}
