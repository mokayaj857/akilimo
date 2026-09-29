import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FarmPage } from "@/components/agritwin/Page";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFarmState } from "@/hooks/use-farm-state";
import type { KenyanMarketPrice } from "@/lib/agritwin/types";

export const Route = createFileRoute("/_authenticated/markets")({
  head: () => ({
    meta: [{ title: "Sell — Akilimo" }],
  }),
  component: MarketsRoute,
});

function kes(n: number) {
  return n.toLocaleString("en-KE");
}

function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`num ${up ? "text-success" : "text-risk"}`}>
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function MarketsRoute() {
  const compact = useIsMobile();
  const { markets, twin } = useFarmState();
  const ranked = useMemo(
    () => [...markets].sort((a, b) => b.netRevenuePerBag - a.netRevenuePerBag),
    [markets],
  );
  const best = ranked[0];
  const closest = useMemo(
    () => [...markets].sort((a, b) => a.distanceKm - b.distanceKm)[0],
    [markets],
  );
  const [openId, setOpenId] = useState(best?.id ?? null);

  if (!best) {
    return (
      <FarmPage title="Sell">
        <p className="text-[14px] text-muted-foreground">No market tickets yet.</p>
      </FarmPage>
    );
  }

  return (
    <FarmPage title="Sell">
      <p className="-mt-3 text-[13px] text-muted-foreground">
        {twin.primaryCrop} · {best.unit}
      </p>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="panel p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Best net</p>
          <p className="num mt-2 text-[1.35rem] leading-none sm:text-2xl">KES {kes(best.netRevenuePerBag)}</p>
          <p className="mt-1.5 truncate text-[12px] text-muted-foreground">{best.town}</p>
        </div>
        <div className="panel p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Gate</p>
          <p className="num mt-2 text-[1.35rem] leading-none sm:text-2xl">KES {kes(best.priceKes)}</p>
          <p className="mt-1.5 text-[12px]">
            <Change value={best.priceChange7DayPercent} />
            <span className="text-muted-foreground"> 7d</span>
          </p>
        </div>
        <div className="panel p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Closest</p>
          <p className="num mt-2 text-[1.35rem] leading-none sm:text-2xl">{closest.distanceKm} km</p>
          <p className="mt-1.5 truncate text-[12px] text-muted-foreground">{closest.town}</p>
        </div>
      </div>

      {!compact && (
        <div>
          <div className="grid grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,0.7fr))] gap-3 border-b border-border px-1 pb-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>Market</span>
            <span className="text-right">Gate</span>
            <span className="text-right">7d</span>
            <span className="text-right">Truck</span>
            <span className="text-right">Net</span>
            <span className="text-right">Km</span>
          </div>
          {ranked.map((mkt) => (
            <MarketRow
              key={mkt.id}
              mkt={mkt}
              open={openId === mkt.id}
              onToggle={() => setOpenId(openId === mkt.id ? null : mkt.id)}
              wide
            />
          ))}
        </div>
      )}

      {compact && (
        <div className="space-y-2">
          {ranked.map((mkt) => (
            <MarketRow
              key={mkt.id}
              mkt={mkt}
              open={openId === mkt.id}
              onToggle={() => setOpenId(openId === mkt.id ? null : mkt.id)}
            />
          ))}
        </div>
      )}
    </FarmPage>
  );
}

function MarketRow({
  mkt,
  open,
  onToggle,
  wide,
}: {
  mkt: KenyanMarketPrice;
  open: boolean;
  onToggle: () => void;
  wide?: boolean;
}) {
  return (
    <div className={`border-b border-border ${mkt.isTopRecommendation ? "border-l-2 border-l-primary pl-3" : "pl-1"}`}>
      <button type="button" onClick={onToggle} className="w-full py-3 text-left">
        {wide ? (
          <div className="grid grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,0.7fr))] items-baseline gap-3">
            <div className="min-w-0">
              <p className="truncate text-[15px]">{mkt.town}</p>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{mkt.marketName}</p>
            </div>
            <p className="num text-right">{kes(mkt.priceKes)}</p>
            <p className="text-right">
              <Change value={mkt.priceChange7DayPercent} />
            </p>
            <p className="num text-right text-muted-foreground">{kes(mkt.transportCostKesPerUnit)}</p>
            <p className="num text-right text-[16px]">{kes(mkt.netRevenuePerBag)}</p>
            <p className="num text-right text-muted-foreground">{mkt.distanceKm}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-[16px]">{mkt.town}</p>
              <p className="num shrink-0 text-[18px]">{kes(mkt.netRevenuePerBag)}</p>
            </div>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{mkt.marketName}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
              <span>
                Gate <span className="num">{kes(mkt.priceKes)}</span>
              </span>
              <Change value={mkt.priceChange7DayPercent} />
              <span className="text-muted-foreground">{mkt.distanceKm} km</span>
            </div>
          </div>
        )}
      </button>
      {open && (
        <div className="pb-3 text-[13px]">
          <p className="text-muted-foreground">
            {mkt.marketDay} · truck {kes(mkt.transportCostKesPerUnit)} / bag
          </p>
          <ul className="mt-2 space-y-1.5">
            {mkt.verifiedWholesaleBuyers.map((b) => (
              <li key={b.phone} className="flex flex-wrap items-baseline justify-between gap-2">
                <span>
                  {b.businessName}
                  <span className="ml-2 text-muted-foreground">{b.name}</span>
                </span>
                <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="num text-primary">
                  {b.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
