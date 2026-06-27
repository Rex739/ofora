import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end", className)}>
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.22em] text-ofora-green">{eyebrow}</p> : null}
        <h1 className="mt-4 text-[clamp(2.7rem,5.4vw,4.8rem)] font-black leading-[0.9] tracking-[-0.075em] text-ofora-deep">
          {title}
        </h1>
        {description ? <p className="mt-5 max-w-2xl text-base leading-7 text-ofora-muted">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">{children}</div> : null}
    </section>
  );
}

export function AppButton({
  children,
  variant = "primary",
  className
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "ofora-focus inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black transition duration-200 hover:-translate-y-0.5",
        variant === "primary" && "bg-ofora-deep text-white hover:bg-ofora-green",
        variant === "secondary" && "bg-[#E7F5B8] text-ofora-deep hover:bg-ofora-mist",
        variant === "tertiary" && "border border-ofora-border bg-white text-ofora-deep hover:border-ofora-green",
        className
      )}
    >
      {children}
    </span>
  );
}

export function MetricPanel({
  label,
  value,
  detail,
  dominant = false
}: {
  label: string;
  value: string;
  detail?: string;
  dominant?: boolean;
}) {
  return (
    <section
      className={cn(
        "border border-ofora-border bg-white p-5",
        dominant ? "min-h-56 bg-ofora-deep text-white lg:col-span-2 lg:row-span-2" : "min-h-28"
      )}
    >
      <p className={cn("text-xs font-black uppercase tracking-[0.18em]", dominant ? "text-[#E7F5B8]" : "text-ofora-muted")}>{label}</p>
      <p className={cn("mt-5 font-black leading-none tracking-[-0.07em] tabular-nums", dominant ? "text-6xl text-[#E7F5B8]" : "text-4xl text-ofora-deep")}>
        {value}
      </p>
      {detail ? <p className={cn("mt-4 text-sm leading-6", dominant ? "text-white/72" : "text-ofora-muted")}>{detail}</p> : null}
    </section>
  );
}

export function EditorialSectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-ofora-border pb-4">
      <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">{title}</h2>
      {action}
    </div>
  );
}

export function RecordPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("min-w-0 border border-ofora-border bg-white", className)}>{children}</section>;
}

export function InlineMetric({ label, value, inverted = false }: { label: string; value: string; inverted?: boolean }) {
  return (
    <div className={cn("border-l pl-4", inverted ? "border-white/18" : "border-ofora-border")}>
      <p className={cn("text-xs font-black uppercase tracking-[0.16em]", inverted ? "text-[#E7F5B8]/75" : "text-ofora-muted")}>{label}</p>
      <p className={cn("mt-2 text-xl font-black tracking-[-0.04em]", inverted ? "text-white" : "text-ofora-deep")}>{value}</p>
    </div>
  );
}

export function MetadataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-ofora-border py-3 text-sm sm:grid-cols-[0.8fr_1fr] sm:gap-4">
      <dt className="text-ofora-muted">{label}</dt>
      <dd className="min-w-0 break-words font-semibold text-ofora-ink">{value}</dd>
    </div>
  );
}
