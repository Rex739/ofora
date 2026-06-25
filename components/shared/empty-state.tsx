import { FileSearch } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="ofora-panel rounded-lg p-8 text-center">
      <FileSearch className="mx-auto h-9 w-9 text-ofora-muted" aria-hidden="true" />
      <h2 className="mt-4 text-base font-semibold text-ofora-ink">{title}</h2>
      <p className="mt-2 text-sm text-ofora-muted">{description}</p>
    </div>
  );
}
