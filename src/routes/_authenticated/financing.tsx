import { createFileRoute } from "@tanstack/react-router";
import { FarmPage } from "@/components/agritwin/Page";
import { Button } from "@/components/ui/button";
import { useFarmState } from "@/hooks/use-farm-state";
import { lenderShot, SHOT } from "@/lib/agritwin/imagery";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/financing")({
  head: () => ({
    meta: [{ title: "Credit — Akilimo" }],
  }),
  component: FinancingRoute,
});

function FinancingRoute() {
  const { saccoOptions, creditReadinessScore, twin } = useFarmState();
  const ranked = [...saccoOptions].sort((a, b) => b.profileMatchPercent - a.profileMatchPercent);
  const best = ranked.find((o) => o.isRecommended) || ranked[0];

  return (
    <FarmPage title="Credit" bleed>
      <div className="photo relative h-[52vh] min-h-[320px] overflow-hidden md:h-[58vh]">
        <img src={SHOT.farmer} alt="" className="object-[center_80%]" />
        <div className="shade absolute inset-0 z-[1]" />
        <div className="absolute inset-0 z-[2] flex flex-col justify-end p-5 pb-24 md:p-10 md:pb-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Twin score</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-5xl font-medium leading-none md:text-7xl">Credit</h1>
              <p className="mt-3 text-[14px] text-foreground/80">
                {twin.totalAcres} ac · {twin.primaryCrop}
              </p>
            </div>
            <p className="num text-6xl leading-none text-primary md:text-8xl">{creditReadinessScore}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 pt-5 md:px-7">
        {ranked.map((opt) => (
          <div
            key={opt.id}
            className={`photo relative h-28 overflow-hidden md:h-32 ${opt.isRecommended ? "ring-1 ring-primary" : ""}`}
          >
            <img src={lenderShot(opt.institutionType)} alt="" className="opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#14120e] via-[#14120e]/88 to-[#14120e]/45" />
            <div className="absolute inset-0 flex items-center justify-between gap-3 p-4 md:px-6">
              <div className="min-w-0">
                <p className="truncate text-[16px] md:text-[18px]">
                  {opt.institutionName}
                  {opt.isRecommended && <span className="ml-2 text-[11px] uppercase tracking-widest text-primary">Best</span>}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {opt.institutionType}
                  {opt === best ? " · from your twin" : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="num text-[18px] md:text-2xl">{opt.maxAmountKes.toLocaleString()}</p>
                <Button
                  size="sm"
                  className="mt-2"
                  variant={opt.isRecommended ? "default" : "outline"}
                  onClick={() => toast.success(`Sent to ${opt.institutionName}`)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FarmPage>
  );
}
