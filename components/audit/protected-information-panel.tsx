import { LockKeyhole } from "lucide-react";

export function ProtectedInformationPanel() {
  const protectedItems = [
    "Competing bid values",
    "Supplier commercial terms",
    "Private capability details",
    "Supporting documents",
    "Internal score breakdowns"
  ];

  return (
    <section className="bg-ofora-deep p-6 text-white">
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
    </section>
  );
}
