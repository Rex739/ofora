import { ShieldCheck } from "lucide-react";

export function VerificationSeal() {
  return (
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ofora-verify/30 bg-ofora-mist text-ofora-green">
      <ShieldCheck className="h-6 w-6" aria-hidden="true" />
    </div>
  );
}
