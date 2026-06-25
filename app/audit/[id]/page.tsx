import { notFound } from "next/navigation";
import { FairAwardRecord } from "@/components/audit/fair-award-record";
import { ProtectedInformationPanel } from "@/components/audit/protected-information-panel";
import { AppShell } from "@/components/layout/app-shell";
import { PageHero, RecordPanel } from "@/components/shared/app-primitives";
import { StatusBadge } from "@/components/shared/status-badge";
import { auditRecords } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = auditRecords.find((item) => item.id === id);

  if (!record) notFound();

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHero
          eyebrow="Fair Award Record"
          title="Award independently validated."
          description="This record confirms that the award followed the selection rules locked before supplier submissions, while protected commercial information remains confidential."
        >
          <StatusBadge status={record.validationStatus} />
        </PageHero>
        <FairAwardRecord record={record} />
        <ProtectedInformationPanel />
        <RecordPanel className="p-6">
          <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Complete audit timeline</h2>
          <ol className="mt-6 grid gap-5">
            {record.timeline.map((event, index) => (
              <li key={event.id} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ofora-mist text-sm font-black text-ofora-green">{index + 1}</span>
                <div className="border-b border-ofora-border pb-4">
                  <p className="font-black text-ofora-deep">{event.label}</p>
                  <p className="text-xs text-ofora-muted">{formatDateTime(event.timestamp)}</p>
                  <p className="mt-1 text-sm text-ofora-muted">{event.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </RecordPanel>
      </div>
    </AppShell>
  );
}
