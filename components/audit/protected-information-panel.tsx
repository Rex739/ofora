import { LockKeyhole } from "lucide-react";

export function ProtectedInformationPanel() {
  const availableItems = [
    "Tender reference",
    "Awarded supplier",
    "Tender policy was locked before submissions",
    "Award validation result",
    "Verification receipt reference",
    "Final award-record reference",
    "Timestamp",
    "Receipt ID"
  ];
  const protectedItems = [
    "Competing bid values",
    "Delivery commitments",
    "Supplier capability data",
    "Internal evaluation scores",
    "Supporting documents"
  ];

  return (
    <section className="grid gap-px overflow-hidden border border-ofora-border bg-ofora-border md:grid-cols-2">
      <div className="bg-white p-6">
        <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Available to auditors</h2>
        <ul className="mt-6 grid gap-3">
          {availableItems.map((item) => (
            <li key={item} className="border-b border-ofora-border pb-3 text-sm font-semibold text-ofora-muted">{item}</li>
          ))}
        </ul>
      </div>
      <div className="bg-ofora-deep p-6 text-white">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-1 h-5 w-5 text-[#E7F5B8]" />
          <div>
            <h2 className="text-2xl font-black tracking-[-0.055em] text-[#E7F5B8]">Commercial information protected</h2>
            <p className="mt-3 text-sm leading-6 text-white/72">This public record confirms the award outcome without revealing protected supplier information.</p>
          </div>
        </div>
        <ul className="mt-6 grid gap-3">
          {protectedItems.map((item) => (
            <li key={item} className="border-b border-white/14 pb-3 text-sm font-semibold text-white/78">{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
