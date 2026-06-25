"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { OforaLogo } from "@/components/layout/app-sidebar";

const links = [
  ["Overview", "/dashboard"],
  ["Tenders", "/tenders"],
  ["Suppliers", "/supplier"],
  ["Awards", "/tenders/OFR-2026-041"],
  ["Audit Records", "/audit"],
  ["Settings", "/settings"]
];

export function MobileNav() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="ofora-focus rounded-md border border-ofora-border bg-white p-2 text-ofora-ink lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ofora-ink/30" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-80 max-w-[86vw] bg-ofora-deep p-5 text-white shadow-panel">
          <div className="flex items-center justify-between">
            <OforaLogo />
            <Dialog.Close className="ofora-focus rounded-md p-2" aria-label="Close navigation">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <nav className="mt-8 grid gap-1" aria-label="Mobile navigation">
            {links.map(([label, href]) => (
              <Dialog.Close asChild key={href}>
                <Link className="rounded-md px-3 py-3 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white" href={href}>
                  {label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
