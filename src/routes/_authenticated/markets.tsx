import { createFileRoute } from "@tanstack/react-router";
import { FarmPage } from "@/components/agritwin/Page";
import { useFarmState } from "@/hooks/use-farm-state";
import { marketShot } from "@/lib/agritwin/imagery";

export const Route = createFileRoute("/_authenticated/markets")({
  head: () => ({
    meta: [{ title: "Sell — Akilimo" }],
  }),
  component: MarketsRoute,
});

function MarketsRoute() {
  const { markets, twin } = useFarmState();
  const ranked = [...markets].sort((a, b) => b.netRevenuePerBag - a.netRevenuePerBag);
  const best = ranked[0];

  return (
    <FarmPage title="Sell" bleed>
      <div className="photo relative h-[48vh] min-h-[300px] overflow-hidden md:h-[56vh]">
        <img src={marketShot(best.town)} alt="" />
        <div className="shade absolute inset-0 z-[1]" />
        <div className="absolute inset-0 z-[2] flex flex-col justify-end p-5 pb-24 md:p-10 md:pb-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Highest net</p>
          <h1 className="font-display mt-1 text-5xl font-medium leading-none md:text-7xl">{best.town}</h1>
          <p className="num mt-3 text-2xl md:text-3xl">KES {best.netRevenuePerBag.toLocaleString()}</p>
          <p className="mt-1 text-[13px] text-foreground/70">
            {twin.primaryCrop} · 90kg · {best.distanceKm} km
          </p>
        </div>
      </div>

      <div className="grid gap-3 px-4 pt-4 sm:grid-cols-2 md:px-7">
        {ranked.map((mkt) => (
          <div key={mkt.id} className="photo relative h-44 overflow-hidden md:h-52">
            <img src={marketShot(mkt.town)} alt="" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            <div className="absolute inset-0 z-[2] flex items-end justify-between p-4">
              <div>
                <p className="font-display text-2xl leading-none">{mkt.town}</p>
                <p className="mt-1 text-[12px] text-foreground/70">{mkt.distanceKm} km</p>
              </div>
              <p className="num text-xl">{mkt.netRevenuePerBag.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </FarmPage>
  );
}
