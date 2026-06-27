"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { OforaLogo } from "@/components/layout/app-sidebar";

const links = [
  ["Dashboard", "/dashboard"],
  ["Tenders", "/tenders"],
  ["Awards", "/awards"],
  ["Audit Records", "/audit"],
  ["Settings", "/settings"]
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Dialog.Root>
      <Dialog.Trigger className="ofora-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-ofora-border bg-white text-ofora-ink lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ofora-ink/30" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-80 max-w-[86vw] bg-ofora-deep p-5 text-white shadow-panel">
          <div className="flex items-center justify-between">
            <Dialog.Close asChild>
              <OforaLogo href="/dashboard" />
            </Dialog.Close>
            <Dialog.Close className="ofora-focus inline-flex h-11 w-11 items-center justify-center rounded-md" aria-label="Close navigation">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <nav className="mt-8 grid gap-1" aria-label="Mobile navigation">
            {links.map(([label, href]) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Dialog.Close asChild key={href}>
                  <Link
                    className={cn(
                      "flex min-h-11 items-center rounded-md px-3 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white",
                      active && "bg-[#E7F5B8] text-ofora-deep hover:bg-[#E7F5B8] hover:text-ofora-deep"
                    )}
                    href={href}
                    aria-current={active ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </Dialog.Close>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
