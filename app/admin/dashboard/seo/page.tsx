import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Search, AlertTriangle } from "lucide-react";
import { getCanonicalSiteSettings } from "@/lib/admin/queries/site-settings";
import { SiteSettingsNotice, SeoSettingsForm } from "@/components/admin/cms/SiteSettingsForms";

export default async function SeoPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin");
  }

  const siteSettings = await getCanonicalSiteSettings();

  return (
    <div className="space-y-6">
      <div className="border-b border-black/30 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orangeWeb/30 bg-orangeWeb/10 text-orangeWeb">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-orangeWeb">Discoverability Domain</p>
            <h1 className="font-heading text-2xl font-semibold text-white">SEO & Metadata</h1>
          </div>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-platinum/80">
          Management surface for meta tags, OpenGraph preview cards, Twitter cards, and search indexing rules.
        </p>
      </div>

      <SiteSettingsNotice />

      {!siteSettings ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-heading text-sm font-semibold text-amber-200">
              Canonical SiteSettings Missing (Integrity Error)
            </h2>
            <p className="mt-1 text-xs text-amber-200/80 leading-relaxed">
              No SiteSettings singleton key = &quot;main&quot; found in MongoDB.
            </p>
          </div>
        </div>
      ) : (
        <SeoSettingsForm initialSettings={siteSettings} />
      )}
    </div>
  );
}
