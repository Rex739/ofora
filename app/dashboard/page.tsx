import Link from "next/link";
import { FileCheck2, Plus, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AppButton, EditorialSectionHeader, MetricPanel, PageHero, RecordPanel } from "@/components/shared/app-primitives";
import { StatusBadge } from "@/components/shared/status-badge";
import { dashboardData, tenderList } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const pending = tenderList.filter((tender) => tender.status.includes("Pending"));

  return (
    <AppShell>
      <div className="space-y-10">
        <PageHero
          eyebrow="Global Relief & Infrastructure Network"
          title={<>Procurement<br />overview.</>}
          description="Track active tenders, validate awards, and maintain a clear record of every decision."
        >
          <Link href="/tenders/new"><AppButton><Plus className="h-4 w-4" />Create tender</AppButton></Link>
          <Link href="/audit"><AppButton variant="tertiary">View audit records</AppButton></Link>
        </PageHero>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div className="grid gap-4 md:grid-cols-2">
            <MetricPanel label="Managed value" value="$2.4M" detail="Across active and recently validated institutional procurement processes." dominant />
            <MetricPanel label="Active tenders" value="4" />
            <MetricPanel label="Awaiting validation" value="2" />
            <MetricPanel label="Validated this quarter" value="18" />
          </div>
          <RecordPanel className="bg-[#E7F5B8] p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-green">Procurement integrity</p>
                <p className="mt-8 text-7xl font-black leading-none tracking-[-0.08em] text-ofora-deep">98.4%</p>
                <p className="mt-5 text-sm leading-6 text-ofora-ink/75">All active tenders have locked evaluation policies.</p>
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-[14px] border-ofora-green/15 bg-white/60">
                <ShieldCheck className="h-9 w-9 text-ofora-green" />
              </div>
            </div>
            <div className="mt-9 grid gap-2">
              <span className="h-px bg-ofora-deep/20" />
              <span className="h-px w-3/4 bg-ofora-deep/20" />
              <span className="h-px w-1/2 bg-ofora-deep/20" />
            </div>
          </RecordPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)]">
          <RecordPanel>
            <div className="p-6">
              <EditorialSectionHeader title="Active tenders" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="border-y border-ofora-border bg-ofora-soft text-xs uppercase tracking-[0.12em] text-ofora-muted">
                  <tr>
                    <th className="px-6 py-4">Tender</th>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4 text-right">Value</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ofora-border">
                  {tenderList.slice(0, 4).map((tender) => (
                    <tr key={tender.id} className={tender.status.includes("Pending") ? "bg-[#FFF7E8]/45" : "hover:bg-ofora-soft/60"}>
                      <td className="px-6 py-5">
                        <Link href={`/tenders/${tender.id}`} className="text-base font-black tracking-[-0.03em] text-ofora-deep">{tender.title}</Link>
                        <p className="mt-1 text-xs font-semibold text-ofora-muted">{tender.id}</p>
                      </td>
                      <td className="px-6 py-5 text-ofora-muted">{tender.organization}</td>
                      <td className="px-6 py-5 text-right font-black tabular-nums text-ofora-deep">{formatCurrency(tender.budget, tender.currency)}</td>
                      <td className="px-6 py-5"><StatusBadge status={tender.status} /></td>
                      <td className="px-6 py-5 text-ofora-muted">{formatDateTime(tender.deadline)}</td>
                      <td className="px-6 py-5"><Link className="font-black text-ofora-green" href={`/tenders/${tender.id}`}>Review award</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RecordPanel>

          <RecordPanel className="p-6">
            <EditorialSectionHeader title="Award validation queue" action={<Link href="/awards" className="text-sm font-black text-ofora-green">View all awards</Link>} />
            <div className="mt-6 space-y-5 border-l border-ofora-border pl-5">
              {pending.map((tender) => (
                <Link key={tender.id} href={`/tenders/${tender.id}`} className="block border-b border-ofora-border pb-5">
                  <p className="text-base font-black tracking-[-0.035em] text-ofora-deep">{tender.title}</p>
                  <p className="mt-1 text-sm text-ofora-muted">Selected supplier pending confirmation</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <StatusBadge status={tender.status} />
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8A5A00]">High attention</span>
                  </div>
                </Link>
              ))}
            </div>
          </RecordPanel>
        </section>

        <RecordPanel className="p-6">
          <EditorialSectionHeader title="Recent integrity activity" />
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {["Policy locked", "Supplier submission received", "Award validation requested", "Fair Award Receipt issued"].map((event, index) => (
              <article key={event} className="border-l border-ofora-border pl-4">
                <FileCheck2 className="h-5 w-5 text-ofora-green" />
                <p className="mt-5 text-lg font-black tracking-[-0.04em] text-ofora-deep">{event}</p>
                <p className="mt-2 text-sm leading-6 text-ofora-muted">{dashboardData.activity[index % dashboardData.activity.length]}</p>
              </article>
            ))}
          </div>
        </RecordPanel>
      </div>
    </AppShell>
  );
}
