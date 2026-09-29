import { createFileRoute, Link } from "@tanstack/react-router";
import { PhotoReel } from "@/components/agritwin/PhotoReel";
import { useMarketTape } from "@/hooks/use-market-tape";
import { useFarmState } from "@/hooks/use-farm-state";
import { cropShot, FIELD } from "@/lib/agritwin/imagery";

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
  const w = 140;
  const h = 40;
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = max === min ? h / 2 : h - ((v - min) / (max - min)) * (h - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-36" aria-hidden>
      <polyline
        fill="none"
        stroke={down ? "var(--risk)" : "var(--success)"}
        strokeWidth="2.2"
        points={pts}
      />
    </svg>
  );
}

function Dial({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <svg viewBox="0 0 84 84" className="size-20 shrink-0" aria-hidden>
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(241,234,220,0.14)" strokeWidth="6" />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="6"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 42 42)"
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
    <main className="pb-24 md:pb-10">
      {!twin.mapped && (
        <Link
          to="/onboarding"
          className="mx-4 mt-4 block border border-primary/40 bg-primary/10 p-3 text-base md:mx-7"
        >
          Map the farm first →
        </Link>
      )}

      <div className="md:grid md:grid-cols-12">
        <Link
          to="/crop-health"
          className="photo relative block min-h-[58vh] overflow-hidden md:col-span-7 md:min-h-[calc(var(--app-height)-3.5rem)]"
        >
          <PhotoReel slides={FIELD} holdMs={3600} sharp />
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/25 to-black/30" />
          <div className="photo-copy absolute inset-0 z-[3] flex flex-col justify-between p-5 pb-32 md:p-8 md:pb-10 lg:p-10">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-bold text-primary">{profile.county}</p>
              <p className="num text-base">{clock} EAT</p>
            </div>
            <div>
              <p className="text-base font-bold text-risk">Leaf wet · scout now</p>
              <p className="num mt-2 text-7xl leading-none text-risk md:text-8xl">
                {diseasePrediction.riskPercentage}
              </p>
              <h1 className="font-display mt-4 max-w-lg text-4xl leading-[1.05] md:text-5xl lg:text-6xl">
                {blight}
              </h1>
              <p className="mt-4 max-w-md text-lg leading-snug">
                {diseasePrediction.affectedZoneName}
                {treat ? ` · ${treat.commercialName}` : ""}
              </p>
              <p className="mt-3 text-base font-bold text-primary">Open Disease →</p>
            </div>
          </div>
        </Link>

        <div className="flex flex-col border-t border-border md:col-span-5 md:border-l md:border-t-0">
          <Link
            to="/digital-twin"
            className="flex flex-1 flex-col justify-between border-b border-border p-5 md:p-7"
          >
            <p className="text-base font-bold text-muted-foreground">Canopy</p>
            <div className="mt-6 flex items-end justify-between gap-3">
              <p className="num text-6xl leading-none">{overallHealthScore}</p>
              <p className="pb-1 text-right text-base">
                NDVI {zone?.ndviScore.toFixed(2)}
                <span className="mt-1 block text-muted-foreground">{twin.totalAcres} ac</span>
              </p>
            </div>
          </Link>
          <Link to="/markets" className="flex flex-1 flex-col justify-between border-b border-border p-5 md:p-7">
            <p className="text-base font-bold text-muted-foreground">Last · {pair(sell?.town ?? "")}</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <p
                className={`num text-5xl leading-none ${
                  book?.flash === "up" ? "text-success" : book?.flash === "down" ? "text-risk" : ""
                }`}
              >
                {kes(live)}
              </p>
              {book && <Spark series={book.spark} down={liveChg < 0} />}
            </div>
            <p className={`mt-3 text-base font-bold ${liveChg >= 0 ? "text-success" : "text-risk"}`}>
              {liveChg >= 0 ? "+" : ""}
              {liveChg} · net {kes(live - (sell?.transportCostKesPerUnit ?? 0))}
            </p>
          </Link>
          <Link to="/financing" className="flex flex-1 items-center justify-between gap-4 p-5 md:p-7">
            <div>
              <p className="text-base font-bold text-muted-foreground">Credit</p>
              <p className="num mt-2 text-5xl leading-none">{creditReadinessScore}</p>
              <p className="mt-2 max-w-[14rem] text-base text-muted-foreground">{lender?.institutionName}</p>
            </div>
            <Dial value={creditReadinessScore} />
          </Link>
        </div>
      </div>

      <div className="overflow-hidden border-y border-border bg-card">
        <div className="tape-run flex w-max gap-8 whitespace-nowrap px-5 py-3 text-base">
          {loop.map((row, i) => (
            <span key={`${row.m.id}-${i}`} className="num inline-flex shrink-0 items-baseline gap-2 font-bold">
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

      <section className="mx-4 mt-8 md:mx-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-base font-bold text-primary">Sky</p>
            <p className="mt-1 text-lg text-muted-foreground">{weather.forecastSummary}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
          {weather.dailyForecast.map((d) => (
            <div key={d.date} className="min-w-[4.5rem] flex-1 border border-border bg-card px-2 py-3 text-center">
              <p className="text-base font-bold">{d.day}</p>
              <div className="mx-auto mt-3 flex h-20 items-end justify-center">
                <div className="w-4 bg-sky" style={{ height: `${(d.rainProb / rainMax) * 100}%` }} />
              </div>
              <p className="num mt-2 text-xl">{d.tempHigh}°</p>
              <p className="mt-1 text-base text-muted-foreground">{d.rainProb}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-10 md:mx-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-base font-bold text-primary">Plots</p>
            <p className="font-display mt-1 text-3xl leading-tight md:text-4xl">
              {harvest != null ? `${harvest} days to cut` : twin.primaryCrop}
            </p>
          </div>
          <Link to="/digital-twin" className="text-base font-bold text-primary">
            Twin →
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {zones.map((z) => (
            <Link key={z.id} to="/digital-twin" className="overflow-hidden border border-border bg-card">
              <div
                className="h-28 bg-cover bg-center md:h-32"
                style={{ backgroundImage: `url(${cropShot(z.cropName)})` }}
              />
              <div className="p-4">
                <p className="text-base font-bold text-muted-foreground">{z.growthStage}</p>
                <p className="font-display mt-1 text-2xl leading-tight">{z.cropName}</p>
                <p className="num mt-3 text-4xl">{z.healthScore}</p>
                <p className="mt-2 text-base">
                  NDVI {z.ndviScore.toFixed(2)} · wet {z.soilMoisturePercent}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
