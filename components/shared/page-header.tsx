import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-2 text-sm font-medium text-ofora-green">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-normal text-ofora-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-ofora-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
