import { AlertTriangle, CheckCircle2, Clock, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Validated: "border-ofora-verify/30 bg-ofora-mist text-ofora-green",
  "Award Pending Validation": "border-amber-200 bg-amber-50 text-amber-800",
  "Not validated": "border-amber-200 bg-amber-50 text-amber-800",
  Open: "border-blue-200 bg-blue-50 text-blue-800",
  "Open for submissions": "border-blue-200 bg-blue-50 text-blue-800",
  "Evaluation in progress": "border-ofora-verify/30 bg-ofora-mist text-ofora-green",
  "Award awaiting validation": "border-amber-200 bg-amber-50 text-amber-800",
  Draft: "border-ofora-border bg-ofora-soft text-ofora-muted",
  "Policy locked": "border-ofora-verify/30 bg-ofora-mist text-ofora-green",
  Eligible: "border-ofora-verify/30 bg-ofora-mist text-ofora-green",
  Ineligible: "border-amber-200 bg-amber-50 text-amber-800",
  Complete: "border-ofora-verify/30 bg-ofora-mist text-ofora-green"
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const Icon = status.includes("locked")
    ? LockKeyhole
    : status.includes("Pending") || status.includes("Open")
      ? Clock
      : status.includes("Not") || status.includes("Ineligible")
        ? AlertTriangle
        : CheckCircle2;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        statusStyles[status] ?? "border-ofora-border bg-white text-ofora-ink",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}
