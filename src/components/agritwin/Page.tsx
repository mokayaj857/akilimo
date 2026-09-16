import type { LucideIcon } from "lucide-react";

export function FarmPage({ eyebrow, title, description, action, children }: { eyebrow: string; title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-12 md:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </main>
  );
}

export function MetricCard({ icon: Icon, label, value, detail, tone = "primary" }: { icon: LucideIcon; label: string; value: string; detail: string; tone?: "primary" | "earth" | "sky" | "risk" }) {
  const tones = { primary: "bg-primary/15 text-primary", earth: "bg-earth/15 text-earth", sky: "bg-sky/15 text-sky", risk: "bg-risk/15 text-risk" };
  return <article className="rounded-2xl border border-border bg-card p-5"><div className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></div><p className="mt-5 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></article>;
}

export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return <div className="mb-4 flex items-end justify-between gap-3"><h2 className="text-lg font-semibold">{title}</h2>{detail && <p className="text-xs text-muted-foreground">{detail}</p>}</div>;
}