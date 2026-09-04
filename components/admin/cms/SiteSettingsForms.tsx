/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { Info } from "lucide-react";

export function SiteSettingsNotice() {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-start gap-3">
      <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-semibold text-blue-200">Canonical Site Settings Active</h3>
        <p className="mt-1 text-xs text-blue-200/70">
          This data powers the identity, global brand copy, and SEO of the portfolio.
        </p>
      </div>
    </div>
  );
}

function MockForm({ title }: { title: string }) {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="p-4 border border-zinc-800 rounded bg-zinc-900/50">
        <h3 className="text-white">{title}</h3>
        <button type="submit" className="mt-2 px-4 py-2 bg-orangeWeb text-black rounded text-xs font-semibold">Save</button>
      </div>
    </form>
  );
}

export function SiteContentForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="Site Content Form" />; }
export function SeoSettingsForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="SEO Form" />; }
export function IdentitySettingsForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="Identity" />; }
export function HeroSettingsForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="Hero" />; }
export function AboutSettingsForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="About" />; }
export function ContactSettingsForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="Contact" />; }
export function SocialLinksForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="Socials" />; }
export function NavigationSettingsForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="Navigation" />; }
export function FooterSettingsForm({ initialSettings }: { initialSettings?: any }) { return <MockForm title="Footer" />; }
