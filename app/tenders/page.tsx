import Link from "next/link";
import { Download, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AppButton, InlineMetric, PageHero, RecordPanel } from "@/components/shared/app-primitives";
import { StatusBadge } from "@/components/shared/status-badge";
import { tenderList } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function TendersPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHero
          eyebrow="Procurement workspace"
          title={<>Active<br />tenders.</>}
          description="Manage tenders from policy creation to validated award."
        >
          <Link href="/tenders/new"><AppButton><Plus className="h-4 w-4" />Create tender</AppButton></Link>
          <button><AppButton variant="tertiary"><Download className="h-4 w-4" />Export records</AppButton></button>
        </PageHero>

        <RecordPanel className="p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-4 sm:grid-cols-3">
              <InlineMetric label="Active tenders" value="4" />
              <InlineMetric label="Pending validation" value="2" />
              <InlineMetric label="Managed value" value="$2.4M" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="relative lg:col-span-2">
                <span className="sr-only">Search tenders</span>
                <Search className="absolute left-3 top-3 h-4 w-4 text-ofora-muted" />
                <input className="ofora-focus w-full rounded-lg border border-ofora-border bg-white py-2.5 pl-9 pr-3 text-sm" placeholder="Search tenders" />
              </label>
              {["Status", "Organization", "Date range"].map((label) => (
                <select key={label} className="ofora-focus rounded-lg border border-ofora-border bg-white px-3 py-2.5 text-sm text-ofora-muted" aria-label={label}>
                  <option>{label}</option>
                </select>
              ))}
            </div>
          </div>
        </RecordPanel>

        <RecordPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="border-b border-ofora-border bg-ofora-soft text-xs uppercase tracking-[0.12em] text-ofora-muted">
                <tr>
                  <th className="px-6 py-4">Tender</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Policy status</th>
                  <th className="px-6 py-4">Submission deadline</th>
                  <th className="px-6 py-4 text-right">Managed value</th>
                  <th className="px-6 py-4">Award status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ofora-border">
                {tenderList.map((tender) => (
                  <tr key={tender.id} className={tender.status.includes("Pending") ? "bg-[#FFF7E8]/45" : "hover:bg-ofora-soft/60"}>
                    <td className="px-6 py-5">
                      <Link href={`/tenders/${tender.id}`} className="text-base font-black tracking-[-0.03em] text-ofora-deep">{tender.title}</Link>
                      <p className="mt-1 text-xs font-semibold text-ofora-muted">{tender.id}</p>
                    </td>
                    <td className="px-6 py-5 text-ofora-muted">{tender.organization}</td>
                    <td className="px-6 py-5"><StatusBadge status="Policy locked" /></td>
                    <td className="px-6 py-5 text-ofora-muted">{formatDateTime(tender.deadline)}</td>
                    <td className="px-6 py-5 text-right font-black tabular-nums text-ofora-deep">{formatCurrency(tender.budget, tender.currency)}</td>
                    <td className="px-6 py-5"><StatusBadge status={tender.status} /></td>
                    <td className="px-6 py-5"><Link className="font-black text-ofora-green" href={`/tenders/${tender.id}`}>Open record</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RecordPanel>
      </div>
    </AppShell>
  );
}
