"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ExternalLink } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { SITE } from "@/lib/content";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/heatmap", label: "Heatmap" },
  { href: "/admin/tech-stack", label: "Tech Stack" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/meta-capi", label: "Meta CAPI" },
  { href: "/admin/funnels", label: "Funnels" },
  { href: "/admin/ctas", label: "CTAs" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/performance", label: "Performance" },
  { href: "/admin/errors", label: "Errors" },
  { href: "/admin/telegram", label: "Telegram" },
  { href: "/admin/reports", label: "Reports" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-950">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">{SITE.projectName}</span>
          <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-400">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1 text-xs font-medium text-navy-300 hover:text-white sm:flex"
          >
            View site <ExternalLink className="h-3 w-3" />
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full border border-navy-700 px-3 py-1.5 text-xs font-medium text-navy-200 transition hover:border-navy-600 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </form>
        </div>
      </div>

      <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
        {TABS.map((tab) => {
          const active = tab.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                active ? "bg-gold-500 text-navy-950" : "text-navy-300 hover:bg-navy-800 hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
