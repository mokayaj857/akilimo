import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { PhotoReel } from "@/components/agritwin/PhotoReel";
import { useFarmState } from "@/hooks/use-farm-state";
import { MARKET_REEL, MARKET_SRCS } from "@/lib/agritwin/imagery";

export const Route = createFileRoute("/_authenticated/markets")({
  head: () => ({
    meta: [{ title: "Sell — Akilimo" }],
  }),
  component: MarketsRoute,
});

function MarketsRoute() {
  const { markets, twin } = useFarmState();
  const ranked = useMemo(
    () => [...markets].sort((a, b) => b.netRevenuePerBag - a.netRevenuePerBag),
    [markets],
  );
  const best = ranked[0];
  const [slide, setSlide] = useState(0);
  const caption = MARKET_REEL[slide]?.place ?? "";
  const lit = slide % ranked.length;

  return (
    <main className="relative min-h-[calc(var(--app-height)-3.5rem)]">
      <PhotoReel
        ordered
        holdMs={3200}
        slides={MARKET_SRCS}
        onIndex={setSlide}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#14120e]/12" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[40%] bg-gradient-to-t from-[#14120e] to-transparent" />

      <div className="relative z-[2] px-5 pb-28 pt-6 md:px-10 md:pb-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Sell · {twin.primaryCrop}</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={caption}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="photo-copy mt-2 font-display text-lg"
              >
                {caption}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex gap-1.5 pt-2">
            {MARKET_REEL.map((s, idx) => (
              <span
                key={s.src + s.place}
                className={`h-1 w-5 transition-colors ${idx === slide ? "bg-primary" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>

        <div className="photo-copy mt-8 max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Highest net</p>
          <h1 className="font-display mt-1 text-4xl font-medium leading-[0.92] md:text-7xl">{best.town}</h1>
          <p className="num mt-3 text-2xl md:text-4xl">KES {best.netRevenuePerBag.toLocaleString()}</p>
          <p className="mt-2 text-[13px] text-[#f7f1e4]/80">
            {best.distanceKm} km · 90kg · {best.marketDay}
          </p>
        </div>

        <div className="mt-5 border border-white/12 bg-[#14120e]/60 backdrop-blur-md md:ml-auto md:max-w-md">
          {ranked.map((mkt, idx) => (
            <motion.div
              key={mkt.id}
              animate={{
                backgroundColor: idx === lit ? "rgba(201,162,39,0.16)" : "rgba(0,0,0,0)",
              }}
              className={`flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 last:border-b-0 ${
                mkt.isTopRecommendation ? "border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
              }`}
            >
              <div>
                <p className="photo-copy text-[16px]">{mkt.town}</p>
                <p className="mt-0.5 text-[11px] text-[#f7f1e4]/55">{mkt.distanceKm} km</p>
              </div>
              <p className="photo-copy num text-[18px]">{mkt.netRevenuePerBag.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
