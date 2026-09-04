import mongoose, { Document, Model, Schema } from "mongoose";
import { ISEOOverride, SEOOverrideSchema } from "@/lib/cms/types";

export interface ISocialLink {
  platform: string;
  url: string;
  label?: string;
  enabled: boolean;
  displayOrder: number;
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    enabled: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface INavigationItem {
  label: string;
  href: string;
  order: number;
  enabled: boolean;
}

const NavigationItemSchema = new Schema<INavigationItem>(
  {
    label: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

export interface ISiteSettings extends Document {
  key: "main";
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
  socials: ISocialLink[];
  navigation: INavigationItem[];
  footer: {
    copyrightText: string;
    tagline?: string;
  };
  seo?: ISEOOverride;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, required: true, default: "main" },
    identity: {
      fullName: { type: String, required: true, trim: true },
      headline: { type: String, required: true, trim: true },
      location: { type: String, required: true, trim: true },
      avatarUrl: { type: String, trim: true },
      statusBadgeText: { type: String, trim: true },
    },
    hero: {
      greeting: { type: String, required: true, trim: true },
      title: { type: String, required: true, trim: true },
      subtitle: { type: String, required: true, trim: true },
      ctaPrimaryText: { type: String, required: true, trim: true },
      ctaPrimaryHref: { type: String, required: true, trim: true },
      ctaSecondaryText: { type: String, required: true, trim: true },
      ctaSecondaryHref: { type: String, required: true, trim: true },
    },
    about: {
      bioParagraphs: { type: [String], default: [] },
      corePillars: { type: [String], default: [] },
    },
    contact: {
      email: { type: String, required: true, trim: true },
      availabilityStatus: { type: String, required: true, trim: true },
      preferredMethod: { type: String, required: true, trim: true },
    },
    socials: { type: [SocialLinkSchema], default: [] },
    navigation: { type: [NavigationItemSchema], default: [] },
    footer: {
      copyrightText: { type: String, required: true, trim: true },
      tagline: { type: String, trim: true },
    },
    seo: { type: SEOOverrideSchema },
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

export const SiteSettingsModel: Model<ISiteSettings> =
  (mongoose.models.SiteSettings as Model<ISiteSettings>) ??
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
