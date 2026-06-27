"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, ClipboardList, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { OforaMark } from "@/components/landing/ofora-mark";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tenders", href: "/tenders", icon: ClipboardList },
  { label: "Suppliers", href: "/supplier", icon: Users },
  { label: "Awards", href: "/awards", icon: Award },
  { label: "Audit Records", href: "/audit", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function OforaLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3" aria-label="Ofora home">
      <OforaMark className="h-10 w-10 border-[#E7F5B8] bg-ofora-deep" />
      <span>
        <span className="block text-xl font-black leading-none tracking-[-0.05em] text-white">Ofora</span>
        <span className="text-xs font-semibold text-white/55">Procurement integrity</span>
      </span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[276px] shrink-0 bg-ofora-deep px-4 py-5 text-white lg:sticky lg:top-0 lg:block">
      <OforaLogo />
      <div className="mt-10 border-t border-white/10 pt-5">
        <p className="px-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#E7F5B8]/75">Workspace</p>
      </div>
      <nav className="mt-3 space-y-1" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-white/68 transition hover:bg-white/8 hover:text-white",
                active && "bg-[#E7F5B8] text-ofora-deep hover:bg-[#E7F5B8] hover:text-ofora-deep"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-5 left-4 right-4 border border-white/10 bg-white/7 p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E7F5B8]">Elena Marquez</p>
        <p className="mt-2 text-sm font-semibold text-white">Strategic Procurement Lead</p>
        <p className="mt-1 text-xs leading-5 text-white/55">Global Relief & Infrastructure Network</p>
      </div>
    </aside>
  );
}
