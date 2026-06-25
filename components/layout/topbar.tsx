"use client";

import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, ChevronDown, Search } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-ofora-border bg-ofora-canvas/94 backdrop-blur">
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <MobileNav />
        <button className="ofora-focus hidden items-center gap-2 rounded-lg border border-ofora-border bg-white px-3.5 py-2.5 text-sm font-semibold text-ofora-ink sm:flex">
          Global Relief & Infrastructure Network
          <ChevronDown className="h-4 w-4 text-ofora-muted" aria-hidden="true" />
        </button>
        <label className="relative ml-auto flex min-w-0 flex-1 items-center sm:max-w-md">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ofora-muted" aria-hidden="true" />
          <input
            className="ofora-focus w-full rounded-lg border border-ofora-border bg-white py-2.5 pl-9 pr-3 text-sm text-ofora-ink placeholder:text-ofora-muted"
            placeholder="Command search: tenders, suppliers, receipts"
          />
        </label>
        <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-ofora-muted xl:block">June 25, 2026</p>
        <button className="ofora-focus rounded-lg border border-ofora-border bg-white p-2.5 text-ofora-muted hover:text-ofora-deep" aria-label="Notifications">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="ofora-focus rounded-full" aria-label="Open user menu">
            <Avatar.Root className="flex h-9 w-9 items-center justify-center rounded-full bg-ofora-deep text-sm font-semibold text-white">
              <Avatar.Fallback>EM</Avatar.Fallback>
            </Avatar.Root>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="z-50 mt-2 w-56 rounded-lg border border-ofora-border bg-white p-2 shadow-panel">
              <DropdownMenu.Label className="px-2 py-1.5 text-xs text-ofora-muted">Elena Marquez</DropdownMenu.Label>
              <DropdownMenu.Item className="rounded-md px-2 py-2 text-sm outline-none hover:bg-ofora-soft">Profile</DropdownMenu.Item>
              <DropdownMenu.Item className="rounded-md px-2 py-2 text-sm outline-none hover:bg-ofora-soft">Organization settings</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
