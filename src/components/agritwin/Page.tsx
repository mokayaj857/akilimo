import type { LucideIcon } from "lucide-react";
import type React from "react";

export function FarmPage({
  title,
  action,
  children,
  bleed,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  bleed?: boolean;
}) {
  if (bleed) {
    return <main className="mx-auto w-full max-w-[1120px] pb-10">{children}</main>;
  }

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-5 md:px-7 md:py-7 space-y-5">
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-display text-[2rem] font-medium leading-none text-foreground md:text-[2.35rem]">
          {title}
        </h1>
        {action && <div className="shrink-0 flex items-center gap-1.5">{action}</div>}
      </div>
      {children}
    </main>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  tone?: "primary" | "earth" | "sky" | "risk";
}) {
  const tones = {
    primary: "text-success",
    earth: "text-earth",
    sky: "text-sky",
    risk: "text-risk",
  };

  return (
    <div className="panel p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <Icon className={`size-3.5 ${tones[tone]}`} strokeWidth={1.75} />
      </div>
      <p className="num mt-2 text-[1.45rem] font-medium leading-none text-foreground">{value}</p>
      {detail && <p className="mt-1.5 text-[11px] text-muted-foreground">{detail}</p>}
    </div>
  );
}

export function SectionTitle({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-2 min-w-0">
        <h2 className="font-display text-[1.05rem] font-semibold text-foreground">{title}</h2>
        {detail && <p className="text-[11px] text-muted-foreground truncate">{detail}</p>}
      </div>
      {action}
    </div>
  );
}
