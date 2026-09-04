import { connectDB } from "@/lib/db/mongo";
import { SiteSettingsModel, ISiteSettings } from "@/lib/db/models/SiteSettings";

export interface PlainSiteSettings {
  _id: string;
  key: string;
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
    availabilityStatus: string;
    preferredMethod: string;
  };
  socials: Array<{
    platform: string;
    url: string;
    label: string;
    enabled: boolean;
    displayOrder: number;
  }>;
  navigation: Array<{
    label: string;
    href: string;
    order: number;
    enabled: boolean;
  }>;
  footer: {
    copyrightText: string;
    tagline?: string;
  };
  seo: {
    title?: string;
    description?: string;
    ogImageUrl?: string;
    noIndex?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getCanonicalSiteSettings(): Promise<PlainSiteSettings | null> {
  await connectDB();

  const doc = await SiteSettingsModel.findOne({ key: "main" }).lean<ISiteSettings>();
  if (!doc) return null;

  return {
    _id: String(doc._id),
    key: doc.key,
    identity: {
      fullName: doc.identity?.fullName ?? "",
      headline: doc.identity?.headline ?? "",
      location: doc.identity?.location ?? "",
      avatarUrl: doc.identity?.avatarUrl,
      statusBadgeText: doc.identity?.statusBadgeText,
    },
    hero: {
      greeting: doc.hero?.greeting ?? "",
      title: doc.hero?.title ?? "",
      subtitle: doc.hero?.subtitle ?? "",
      ctaPrimaryText: doc.hero?.ctaPrimaryText ?? "",
      ctaPrimaryHref: doc.hero?.ctaPrimaryHref ?? "",
      ctaSecondaryText: doc.hero?.ctaSecondaryText ?? "",
      ctaSecondaryHref: doc.hero?.ctaSecondaryHref ?? "",
    },
    about: {
      bioParagraphs: doc.about?.bioParagraphs ?? [],
      corePillars: doc.about?.corePillars ?? [],
    },
    contact: {
      email: doc.contact?.email ?? "",
      availabilityStatus: doc.contact?.availabilityStatus ?? "",
      preferredMethod: doc.contact?.preferredMethod ?? "",
    },
    socials: (doc.socials ?? []).map((s) => ({
      platform: s.platform,
      url: s.url,
      label: s.label ?? "",
      enabled: s.enabled ?? true,
      displayOrder: s.displayOrder ?? 0,
    })),
    navigation: (doc.navigation ?? []).map((n) => ({
      label: n.label,
      href: n.href,
      order: n.order ?? 0,
      enabled: n.enabled ?? true,
    })),
    footer: {
      copyrightText: doc.footer?.copyrightText ?? "",
      tagline: doc.footer?.tagline,
    },
    seo: {
      title: doc.seo?.title,
      description: doc.seo?.description,
      ogImageUrl: doc.seo?.ogImageUrl,
      noIndex: doc.seo?.noIndex ?? false,
    },
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
  };
}
