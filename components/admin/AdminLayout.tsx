"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, FolderKanban, LayoutPanelLeft, LogOut, Menu, Trophy, X } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { typography } from "@/lib/typography";

interface AdminLayoutProps {
  children: ReactNode;
  email: string;
}

const navItems = [
  {
    label: "Projects",
    href: "/admin/dashboard/projects",
    icon: FolderKanban,
  },
  {
    label: "Hall of Fame",
    href: "/admin/dashboard/wins",
    icon: Trophy,
  },
  {
    label: "Resume",
    href: "/admin/dashboard/resume",
    icon: FileText,
  },
  {
    label: "Content",
    href: "/admin/dashboard/content",
    icon: LayoutPanelLeft,
  },
];

export default function AdminLayout({ children, email }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const activeItem = useMemo(
    () => navItems.find((item) => pathname.startsWith(item.href)) ?? null,
    [pathname],
  );

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

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

  return (
    <div className="min-h-screen bg-black text-platinum">
      <header className="sticky top-0 z-40 border-b border-oxfordBlue/70 bg-oxfordBlue/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-orangeWeb">Admin Panel</p>
            <p className="truncate font-heading text-lg font-semibold text-white">
              {activeItem?.label ?? "Dashboard"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/40 bg-black/20 text-platinum transition-colors hover:text-white"
            aria-label="Open admin navigation"
            aria-expanded={isNavOpen}
            aria-controls="admin-mobile-nav"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-black/55 transition-opacity duration-200 lg:hidden ${
          isNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsNavOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="admin-mobile-nav"
        className={`fixed top-0 left-0 z-60 flex h-dvh w-[86vw] max-w-80 flex-col border-r border-black/35 bg-oxfordBlue shadow-[0_24px_60px_rgba(0,0,0,0.55)] transition-transform duration-200 lg:hidden ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isNavOpen}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-black/35 px-5 py-4">
          <div>
            <p className={typography.adminEyebrow}>Admin Panel</p>
            <h2 className="mt-1 font-heading text-xl font-semibold text-white">Talha Ahmad</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsNavOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/40 bg-black/20 text-platinum transition-colors hover:text-white"
            aria-label="Close admin navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-orangeWeb/15 text-orangeWeb"
                    : "text-platinum hover:bg-black/30 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-black/35 px-3 py-4">
          <button
            type="button"
            onClick={() => void onLogout()}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-medium text-platinum transition-colors hover:bg-black/30 hover:text-orangeWeb"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Logout
          </button>
          <div className="mt-3 rounded-lg border border-black/35 bg-black/20 px-4 py-3">
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-platinum/70">Logged in</p>
            <p className="mt-1 truncate text-sm text-white">{email}</p>
          </div>
        </div>
      </aside>

      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-black/30 bg-oxfordBlue lg:flex">
        <div className="border-b border-black/30 px-6 py-6">
          <p className={typography.adminEyebrow}>Admin Panel</p>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white">
            Talha Ahmad
          </h1>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-orangeWeb/15 text-orangeWeb"
                    : "text-platinum hover:bg-black/30 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => void onLogout()}
            className="mt-4 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-base font-medium text-platinum transition-colors hover:bg-black/30 hover:text-orangeWeb"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </nav>

        <div className="border-t border-black/30 px-6 py-4">
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-platinum/70">Logged in</p>
          <p className="mt-1 truncate text-base text-white">{email}</p>
        </div>
      </aside>

      <main className="w-full lg:pl-72">
        <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
