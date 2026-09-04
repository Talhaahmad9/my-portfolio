"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { typography } from "@/lib/typography";
import { ADMIN_NAV_GROUPS, type NavItem } from "@/lib/admin/navigation";

interface AdminLayoutProps {
  children: ReactNode;
  email: string;
}

export default function AdminLayout({ children, email }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Flatten all items for current route active label lookup
  const allNavItems = useMemo(
    () => ADMIN_NAV_GROUPS.flatMap((group) => group.items),
    []
  );

  const activeItem = useMemo(() => {
    if (pathname === "/admin/dashboard") {
      return allNavItems.find((item) => item.href === "/admin/dashboard") ?? null;
    }
    // Find matching non-dashboard nav item with longest matching href
    const matches = allNavItems.filter(
      (item) => item.href !== "/admin/dashboard" && pathname.startsWith(item.href)
    );
    if (matches.length > 0) {
      return matches.sort((a, b) => b.href.length - a.href.length)[0];
    }
    return null;
  }, [pathname, allNavItems]);

  useEffect(() => {
    if (!isNavOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isNavOpen]);

  useEffect(() => {
    if (!isNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isNavOpen]);

  const onLogout = async (): Promise<void> => {
    setIsNavOpen(false);
    await logoutAction();
    router.push("/admin");
    router.refresh();
  };

  const renderNavLinks = (onItemClick?: () => void) => (
    <div className="space-y-5">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.groupLabel} className="space-y-1">
          <p className="px-3 font-heading text-[10px] uppercase tracking-[0.2em] text-platinum/50">
            {group.groupLabel}
          </p>
          {group.items.map((item: NavItem) => {
            const isExact = pathname === item.href;
            const isChildMatch =
              item.href !== "/admin/dashboard" &&
              pathname.startsWith(item.href) &&
              (pathname.length === item.href.length || pathname[item.href.length] === "/");
            const isActive = isExact || isChildMatch;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orangeWeb/15 text-orangeWeb"
                    : "text-platinum/80 hover:bg-black/40 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-orangeWeb" : "text-platinum/60 group-hover:text-white"}`} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badgeText && (
                  <span
                    className={`ml-2 rounded px-1.5 py-0.5 font-heading text-[10px] font-medium tracking-wide ${
                      item.isLegacy
                        ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                        : "border border-orangeWeb/30 bg-orangeWeb/15 text-orangeWeb"
                    }`}
                  >
                    {item.badgeText}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-platinum">
      {/* Mobile Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-oxfordBlue/70 bg-oxfordBlue/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-orangeWeb">Admin CMS</p>
            <p className="truncate font-heading text-base font-semibold text-white">
              {activeItem?.label ?? "Dashboard"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/40 bg-black/20 text-platinum transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-orangeWeb"
            aria-label="Open admin navigation"
            aria-expanded={isNavOpen}
            aria-controls="admin-mobile-nav"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 lg:hidden ${
          isNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsNavOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar Drawer */}
      <aside
        id="admin-mobile-nav"
        className={`fixed top-0 left-0 z-60 flex h-dvh w-[86vw] max-w-80 flex-col border-r border-black/35 bg-oxfordBlue shadow-[0_24px_60px_rgba(0,0,0,0.55)] transition-transform duration-200 lg:hidden ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isNavOpen}
        aria-modal="true"
        role="dialog"
        aria-label="Mobile Admin Navigation"
      >
        <div className="flex items-center justify-between border-b border-black/35 px-5 py-4">
          <div>
            <p className={typography.adminEyebrow}>Portfolio CMS</p>
            <h2 className="mt-1 font-heading text-lg font-semibold text-white">Talha Ahmad</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsNavOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/40 bg-black/20 text-platinum transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-orangeWeb"
            aria-label="Close admin navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile Admin Sidebar" className="flex-1 overflow-y-auto px-3 py-4">
          {renderNavLinks(() => setIsNavOpen(false))}
        </nav>

        <div className="border-t border-black/35 px-3 py-4">
          <button
            type="button"
            onClick={() => void onLogout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-platinum transition-colors hover:bg-black/30 hover:text-orangeWeb"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
          <div className="mt-3 rounded-lg border border-black/35 bg-black/20 px-3 py-2.5">
            <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-platinum/60">Logged in</p>
            <p className="mt-0.5 truncate text-xs text-white">{email}</p>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-black/30 bg-oxfordBlue lg:flex">
        <div className="border-b border-black/30 px-5 py-5">
          <p className={typography.adminEyebrow}>Portfolio CMS</p>
          <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight text-white">
            Talha Ahmad
          </h1>
        </div>

        <nav aria-label="Desktop Admin Sidebar" className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {renderNavLinks()}
        </nav>

        <div className="border-t border-black/30 px-5 py-4">
          <button
            type="button"
            onClick={() => void onLogout()}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-platinum/80 transition-colors hover:bg-black/30 hover:text-orangeWeb"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
          <div className="mt-2.5 rounded border border-black/30 bg-black/20 px-3 py-2">
            <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-platinum/60">Logged in</p>
            <p className="mt-0.5 truncate text-xs text-white">{email}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="w-full lg:pl-64">
        <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
