import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Settings, CheckCircle2, AlertTriangle, ArrowRight, LayoutPanelLeft, Search } from "lucide-react";
import { getCanonicalSiteSettings } from "@/lib/admin/queries/site-settings";
import { SiteSettingsNotice } from "@/components/admin/cms/SiteSettingsForms";

export default async function SettingsPage() {
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
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-orangeWeb">System Domain</p>
            <h1 className="font-heading text-2xl font-semibold text-white">Site Settings</h1>
          </div>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-platinum/80">
          Global site settings, environment status, singleton health, and administrative metadata.
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
        <div className="space-y-6">
          {/* Status Box */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-white">Singleton Health & Summary</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> Healthy Singleton (key = &quot;main&quot;)
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-zinc-400 font-medium">Singleton Key:</span>
                <p className="font-mono text-cyan-400 mt-0.5">{siteSettings.key}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Document ID:</span>
                <p className="font-mono text-zinc-400 mt-0.5">{siteSettings._id}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Primary Name:</span>
                <p className="text-white font-medium mt-0.5">{siteSettings.identity.fullName || "Not set"}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Headline:</span>
                <p className="text-white font-medium mt-0.5">{siteSettings.identity.headline || "Not set"}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Location:</span>
                <p className="text-white font-medium mt-0.5">{siteSettings.identity.location || "Not set"}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Contact Email:</span>
                <p className="font-mono text-white mt-0.5">{siteSettings.contact.email || "Not set"}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Created At:</span>
                <p className="font-mono text-zinc-400 mt-0.5">
                  {siteSettings.createdAt ? new Date(siteSettings.createdAt).toLocaleString() : "Unknown"}
                </p>
              </div>
              <div>
                <span className="text-zinc-400 font-medium">Last Updated:</span>
                <p className="font-mono text-zinc-400 mt-0.5">
                  {siteSettings.updatedAt ? new Date(siteSettings.updatedAt).toLocaleString() : "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/dashboard/site-content"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-orangeWeb/50 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orangeWeb/30 bg-orangeWeb/10 text-orangeWeb">
                  <LayoutPanelLeft className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-orangeWeb transition">
                    Edit Brand Copy & Content
                  </h3>
                  <p className="text-xs text-zinc-400">Manage identity, hero, bio, contact, socials, and nav links</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-orangeWeb transition shrink-0" />
            </Link>

            <Link
              href="/admin/dashboard/seo"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-orangeWeb/50 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orangeWeb/30 bg-orangeWeb/10 text-orangeWeb">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-orangeWeb transition">
                    Edit SEO & Metadata
                  </h3>
                  <p className="text-xs text-zinc-400">Manage title tags, meta description, OpenGraph image, and noIndex</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-orangeWeb transition shrink-0" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
