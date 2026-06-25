import { AppShell } from "@/components/layout/app-shell";
import { PageHero, RecordPanel } from "@/components/shared/app-primitives";

const sections = [
  ["Organization profile", "Identity, legal name, operating regions, and procurement owner details."],
  ["Procurement preferences", "Default currencies, scoring rules, deadline conventions, and approval thresholds."],
  ["Team members", "Role-based access for procurement, finance, compliance, and oversight users."],
  ["Audit visibility", "Configure which Fair Award Records can be shared externally."],
  ["Notification preferences", "Validation queue alerts, policy lock confirmations, and receipt events."]
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHero
          eyebrow="Organization controls"
          title="Settings."
          description="Configure organization identity, users, approval roles, audit visibility, and validation provider connections."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map(([title, copy]) => (
            <RecordPanel key={title} className="p-6">
              <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-ofora-muted">{copy}</p>
            </RecordPanel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
