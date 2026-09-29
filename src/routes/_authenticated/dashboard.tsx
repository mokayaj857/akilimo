import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useFarmState } from "@/hooks/use-farm-state";
import { cropShot, marketShot, SHOT } from "@/lib/agritwin/imagery";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Desk — Akilimo" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, twin, diseasePrediction, markets, saccoOptions, creditReadinessScore } = useFarmState();
  const sell = markets.find((m) => m.isTopRecommendation) || markets[0];
  const lender = saccoOptions.find((l) => l.isRecommended) || saccoOptions[0];
  const first = (profile.fullName || "Farmer").split(" ")[0];

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pb-8 pt-4 md:px-7">
      {!twin.mapped && (
        <Link to="/onboarding" className="mb-4 block border border-primary/40 bg-primary/10 p-3 text-[13px]">
          Map the farm first →
        </Link>
      )}

      <Link
        to="/digital-twin"
        className="photo relative block h-[46vh] min-h-[300px] overflow-hidden md:h-[54vh]"
      >
        <img src={cropShot(twin.primaryCrop)} alt="" />
        <div className="shade absolute inset-0 z-[1]" />
        <div className="absolute inset-0 z-[2] flex flex-col justify-end p-5 pb-24 md:p-8 md:pb-8">
          <p className="text-[12px] uppercase tracking-[0.2em] text-primary">{twin.farmName}</p>
          <h1 className="font-display mt-1 text-5xl font-medium leading-[0.9] md:text-7xl">{first}</h1>
          <p className="mt-4 num text-[15px] text-foreground/90">
            {twin.totalAcres} ac · {twin.primaryCrop}
          </p>
        </div>
      </Link>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Link to="/crop-health" className="photo group relative h-56 overflow-hidden md:h-72">
          <img src={SHOT.maizeLeaf} alt="" className="transition duration-500 group-hover:scale-105" />
          <div className="shade absolute inset-0 z-[1]" />
          <div className="absolute inset-0 z-[2] flex flex-col justify-end p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Watch</p>
            <p className="font-display text-3xl text-risk">{diseasePrediction.riskLevel}</p>
            <p className="mt-1 flex items-center gap-1 text-[13px]">
              Spray window <ArrowRight className="size-3" />
            </p>
          </div>
        </Link>

        <Link to="/markets" className="photo group relative h-56 overflow-hidden md:h-72">
          <img src={marketShot(sell.town)} alt="" className="transition duration-500 group-hover:scale-105" />
          <div className="shade absolute inset-0 z-[1]" />
          <div className="absolute inset-0 z-[2] flex flex-col justify-end p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Sell</p>
            <p className="font-display text-3xl">{sell.town.split(" ")[0]}</p>
            <p className="num mt-1 text-[15px]">KES {sell.netRevenuePerBag.toLocaleString()}</p>
          </div>
        </Link>

        <Link to="/financing" className="photo group relative h-56 overflow-hidden md:h-72">
          <img src={SHOT.hands} alt="" className="transition duration-500 group-hover:scale-105" />
          <div className="shade absolute inset-0 z-[1]" />
          <div className="absolute inset-0 z-[2] flex flex-col justify-end p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Credit</p>
            <p className="num text-4xl">{creditReadinessScore}</p>
            <p className="mt-1 text-[13px]">{lender.institutionType}</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
