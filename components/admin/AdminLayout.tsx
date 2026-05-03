"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, FolderKanban, LogOut, Trophy } from "lucide-react";
import { logoutAction } from "@/actions/auth";

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
];

export default function AdminLayout({ children, email }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async (): Promise<void> => {
    await logoutAction();
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-platinum">
      <div className="md:hidden border-b border-oxfordBlue bg-oxfordBlue/90">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
            className="ml-auto inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-platinum transition-colors hover:bg-black/30 hover:text-orangeWeb"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden min-h-screen w-72 flex-col border-r border-black/30 bg-oxfordBlue md:flex">
          <div className="border-b border-black/30 px-6 py-6">
            <p className="text-xs font-medium uppercase tracking-widest text-orangeWeb">Admin Panel</p>
            <h1 className="mt-2 text-xl font-semibold text-white">Talha Ahmad</h1>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
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
              className="mt-4 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-platinum transition-colors hover:bg-black/30 hover:text-orangeWeb"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </nav>

          <div className="border-t border-black/30 px-6 py-4">
            <p className="text-xs uppercase tracking-widest text-platinum/70">Logged in</p>
            <p className="mt-1 truncate text-sm text-white">{email}</p>
          </div>
        </aside>

        <main className="w-full px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
