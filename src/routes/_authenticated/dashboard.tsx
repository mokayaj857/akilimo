import { createFileRoute, Link } from "@tanstack/react-router";
import { PhotoReel } from "@/components/agritwin/PhotoReel";
import { useMarketTape } from "@/hooks/use-market-tape";
import { useFarmState } from "@/hooks/use-farm-state";
import { FIELD } from "@/lib/agritwin/imagery";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Desk — Akilimo" }],
  }),
  component: DashboardPage,
});

function kes(n: number) {
  return n.toLocaleString("en-KE");
}

function pair(town: string) {
  return town.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "MKT";
}

function daysUntil(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.round(ms / 86_400_000));
}

function Spark({ series, down }: { series: number[]; down?: boolean }) {
  if (series.length < 2) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const w = 120;
  const h = 36;
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = max === min ? h / 2 : h - ((v - min) / (max - min)) * (h - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-[7.5rem]" aria-hidden>
      <polyline
        fill="none"
        stroke={down ? "var(--risk)" : "var(--success)"}
        strokeWidth="1.7"
        points={pts}
      />
    </svg>
  );
}

function Dial({ value }: { value: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <svg viewBox="0 0 88 88" className="size-[5.5rem] shrink-0" aria-hidden>
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(241,234,220,0.12)" strokeWidth="5" />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="5"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="square"
        transform="rotate(-90 44 44)"
      />
    </svg>
  );
}

function DashboardPage() {
  const {
    profile,
    twin,
    zones,
    weather,
    diseasePrediction,
    markets,
    saccoOptions,
    creditReadinessScore,
    overallHealthScore,
  } = useFarmState();
  const { books, clock } = useMarketTape(markets);
  const sell = markets.find((m) => m.isTopRecommendation) || markets[0];
  const lender = saccoOptions.find((l) => l.isRecommended) || saccoOptions[0];
  const book = sell ? books[sell.id] : undefined;
  const live = book?.last ?? sell?.priceKes ?? 0;
  const liveChg = live - (book?.open ?? sell?.priceKes ?? live);
  const zone = zones[0];
  const blight = diseasePrediction.diseaseName.split("(")[0].trim();
  const treat = diseasePrediction.recommendedActions.pcpbApprovedInputs[0];
  const harvest = zone ? daysUntil(zone.expectedHarvestDate) : null;
  const tape = markets.map((m) => {
    const last = books[m.id]?.last ?? m.priceKes;
    const open = books[m.id]?.open ?? m.priceKes;
    return { m, last, chg: last - open };
  });
  const loop = [...tape, ...tape];
  const rainMax = Math.max(1, ...weather.dailyForecast.map((d) => d.rainProb));

  return (
    <main className="pb-12">
      {!twin.mapped && (
        <Link
          to="/onboarding"
          className="mx-4 mt-4 block border border-primary/40 bg-primary/10 p-3 text-[13px] md:mx-7"
        >
          Map the farm first →
        </Link>
      )}

      <div className="relative">
        <Link to="/crop-health" className="photo relative block min-h-[72vh] overflow-hidden md:min-h-[78vh]">
          <PhotoReel slides={FIELD} holdMs={3400} />
          <div className="absolute inset-0 z-[2] bg-gradient-to-b from-[#14120e]/35 via-transparent to-[#14120e]" />
          <div className="photo-copy absolute inset-0 z-[3] flex flex-col justify-between p-5 pb-28 md:p-10 md:pb-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{profile.county}</p>
                <p className="mt-2 text-[13px] text-[#f7f1e4]/70">Sentinel this morning</p>
              </div>
              <p className="num text-[13px] text-[#f7f1e4]/80">{clock} EAT</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-risk">The leaf is wet</p>
              <p className="num mt-2 text-[5.5rem] leading-[0.8] text-risk md:text-[8rem]">
                {diseasePrediction.riskPercentage}
              </p>
              <h1 className="font-display mt-4 max-w-xl text-4xl font-medium leading-[0.92] md:text-6xl">
                {blight}
              </h1>
              <p className="mt-4 max-w-sm text-[15px] leading-snug text-[#f7f1e4]/88">
                {diseasePrediction.affectedZoneName}
                {treat ? ` · ${treat.commercialName}` : ""}
              </p>
              <p className="mt-2 text-[13px] text-primary">Walk the rows →</p>
            </div>
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] hidden md:block">
          <div className="pointer-events-auto mx-auto grid max-w-[1120px] grid-cols-3 border-t border-white/10 bg-[#14120e]/80 backdrop-blur-md">
            <Link to="/digital-twin" className="border-r border-white/10 px-7 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Canopy</p>
              <p className="num mt-1 text-3xl">{overallHealthScore}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">NDVI {zone?.ndviScore.toFixed(2)}</p>
            </Link>
            <Link to="/markets" className="border-r border-white/10 px-7 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Last · {pair(sell?.town ?? "")}</p>
              <p className="num mt-1 text-3xl">{kes(live)}</p>
              <p className={`mt-1 text-[12px] ${liveChg >= 0 ? "text-success" : "text-risk"}`}>
                {liveChg >= 0 ? "+" : ""}
                {liveChg} session
              </p>
            </Link>
            <Link to="/financing" className="px-7 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Credit</p>
              <p className="num mt-1 text-3xl">{creditReadinessScore}</p>
              <p className="mt-1 truncate text-[12px] text-muted-foreground">{lender?.institutionName}</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 overflow-hidden border border-border md:mx-7 md:mt-0 md:border-x-0 md:border-b md:border-t-0">
        <div className="tape-run flex w-max gap-7 whitespace-nowrap px-4 py-2.5 text-[12px]">
          {loop.map((row, i) => (
            <span key={`${row.m.id}-${i}`} className="num inline-flex shrink-0 items-baseline gap-2">
              <span className="text-white/25">/</span>
              <span className="text-muted-foreground">{pair(row.m.town)}</span>
              <span>{kes(row.last)}</span>
              <span className={row.chg >= 0 ? "text-success" : "text-risk"}>
                {row.chg >= 0 ? "▲" : "▼"}
                {Math.abs(row.chg)}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 grid gap-3 md:mx-7 md:hidden">
        <Link to="/digital-twin" className="flex items-end justify-between border border-border bg-card px-4 py-3">
          <span className="text-[12px] text-muted-foreground">Canopy</span>
          <span className="num text-2xl">{overallHealthScore}</span>
        </Link>
        <Link to="/markets" className="flex items-end justify-between border border-border bg-card px-4 py-3">
          <span className="text-[12px] text-muted-foreground">Last {pair(sell?.town ?? "")}</span>
          <span className="num text-2xl">{kes(live)}</span>
        </Link>
        <Link to="/financing" className="flex items-end justify-between border border-border bg-card px-4 py-3">
          <span className="text-[12px] text-muted-foreground">Credit</span>
          <span className="num text-2xl">{creditReadinessScore}</span>
        </Link>
      </div>

      <section className="mx-4 mt-8 md:mx-7 md:mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Bag</p>
            <h2 className="font-display mt-1 text-3xl leading-none md:text-4xl">{sell?.town}</h2>
          </div>
          <Link to="/markets" className="text-[13px] text-primary">
            Full tape →
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <p
            className={`num text-5xl leading-none md:text-7xl ${
              book?.flash === "up" ? "text-success" : book?.flash === "down" ? "text-risk" : ""
            }`}
          >
            {kes(live)}
          </p>
          <div className="flex items-end gap-4">
            {book && <Spark series={book.spark} down={liveChg < 0} />}
            <div className="text-right">
              <p className={`num text-lg ${liveChg >= 0 ? "text-success" : "text-risk"}`}>
                {liveChg >= 0 ? "+" : ""}
                {liveChg}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                net {kes(live - (sell?.transportCostKesPerUnit ?? 0))}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-4 mt-10 grid items-center gap-6 border-y border-border py-8 md:mx-7 md:grid-cols-[auto_1fr]">
        <Link to="/financing" className="flex items-center gap-4">
          <Dial value={creditReadinessScore} />
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary">Ready</p>
            <p className="num mt-1 text-4xl leading-none">{creditReadinessScore}</p>
            <p className="mt-2 max-w-[12rem] text-[13px] text-muted-foreground">{lender?.productName}</p>
          </div>
        </Link>
        <div className="flex gap-2 overflow-x-auto md:justify-end">
          {weather.dailyForecast.map((d) => (
            <div key={d.date} className="w-14 shrink-0 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.day}</p>
              <div className="mx-auto mt-2 flex h-16 items-end justify-center">
                <div className="w-3 bg-sky/70" style={{ height: `${(d.rainProb / rainMax) * 100}%` }} />
              </div>
              <p className="num mt-2 text-[13px]">{d.tempHigh}°</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-10 md:mx-7">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Plots</p>
            <p className="font-display mt-1 text-3xl leading-none">
              {harvest != null ? `${harvest} days` : twin.primaryCrop}
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">to first maize cut</p>
          </div>
          <Link to="/digital-twin" className="text-[13px] text-primary">
            Twin →
          </Link>
        </div>
        <div className="mt-6 grid gap-px bg-border md:grid-cols-3">
          {zones.map((z) => (
            <Link key={z.id} to="/digital-twin" className="bg-background p-4 md:p-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{z.growthStage}</p>
              <p className="mt-2 font-display text-2xl leading-none">{z.cropName}</p>
              <p className="num mt-4 text-4xl">{z.healthScore}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px] text-muted-foreground">
                <span>
                  NDVI <span className="num text-foreground">{z.ndviScore.toFixed(2)}</span>
                </span>
                <span>
                  Wet <span className="num text-foreground">{z.soilMoisturePercent}%</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
