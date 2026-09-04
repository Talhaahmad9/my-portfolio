import { getCanonicalSiteSettings } from "@/lib/admin/queries/site-settings";
import { LayoutPanelLeft, AlertTriangle } from "lucide-react";
import {
  SiteSettingsNotice,
  IdentitySettingsForm,
  HeroSettingsForm,
  AboutSettingsForm,
  ContactSettingsForm,
  SocialLinksForm,
  NavigationSettingsForm,
  FooterSettingsForm,
} from "@/components/admin/cms/SiteSettingsForms";

export default async function AdminSiteContentPage() {
  const siteSettings = await getCanonicalSiteSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-orangeWeb">
            <LayoutPanelLeft className="h-4 w-4" />
            Brand Copy & Identity
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold text-white">Site Content</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Canonical singleton (key = &quot;main&quot;) storing personal identity, hero headlines, bio paragraphs, socials, and navigation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
            Canonical Editing Active
          </span>
        </div>
      </div>

      <SiteSettingsNotice />

      {/* Singleton Missing Integrity Blocker */}
      {!siteSettings ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            Canonical SiteSettings Document Missing (Integrity Error)
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed max-w-2xl">
            No SiteSettings document with key &quot;main&quot; was found in MongoDB. Editing is disabled until the singleton document is seeded or restored.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <IdentitySettingsForm initialSettings={siteSettings} />
          <HeroSettingsForm initialSettings={siteSettings} />
          <AboutSettingsForm initialSettings={siteSettings} />
          <ContactSettingsForm initialSettings={siteSettings} />
          <SocialLinksForm initialSettings={siteSettings} />
          <NavigationSettingsForm initialSettings={siteSettings} />
          <FooterSettingsForm initialSettings={siteSettings} />
        </div>
      )}
    </div>
  );
}
