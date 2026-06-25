import { CheckCircle2 } from "lucide-react";

export function SupplierRequirementsSummary({
  minimumQuality,
  maximumDelivery
}: {
  minimumQuality: number;
  maximumDelivery: number;
}) {
  return (
    <section className="border-t border-ofora-border py-6">
      <h3 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Supplier requirements</h3>
      <p className="mt-2 text-sm leading-6 text-ofora-muted">Suppliers must meet these requirements before they can be considered.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Requirement title="Minimum quality rating" value={`${minimumQuality} out of 100`} copy={`Suppliers scoring below ${minimumQuality} will not be considered.`} />
        <Requirement title="Latest acceptable delivery time" value={`${maximumDelivery} days`} copy={`Suppliers unable to deliver within ${maximumDelivery} days will not be considered.`} />
      </div>
    </section>
  );
}

function Requirement({ title, value, copy }: { title: string; value: string; copy: string }) {
  return (
    <div className="grid grid-cols-[2rem_1fr] gap-4 border border-ofora-border bg-white p-5">
      <CheckCircle2 className="mt-1 h-5 w-5 text-ofora-green" />
      <div>
        <p className="text-sm font-black uppercase tracking-[0.14em] text-ofora-muted">{title}</p>
        <p className="mt-3 text-2xl font-black tracking-[-0.05em] text-ofora-deep">{value}</p>
        <p className="mt-2 text-sm leading-6 text-ofora-muted">{copy}</p>
      </div>
    </div>
  );
}
