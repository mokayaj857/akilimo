import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PhotoReel } from "@/components/agritwin/PhotoReel";
import { useFarmState } from "@/hooks/use-farm-state";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Desk — Akilimo" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { twin, diseasePrediction, markets, saccoOptions, creditReadinessScore } = useFarmState();
  const sell = markets.find((m) => m.isTopRecommendation) || markets[0];
  const lender = saccoOptions.find((l) => l.isRecommended) || saccoOptions[0];

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
        <PhotoReel />
        <div className="photo-copy photo-plate absolute inset-0 z-[3] flex flex-col justify-end p-5 pb-24 md:p-8 md:pb-8">
          <h1 className="font-display text-5xl font-medium leading-[0.9] md:text-7xl">Welcome farmer</h1>
        </div>
      </Link>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Link to="/crop-health" className="photo group relative h-56 overflow-hidden md:h-72">
          <PhotoReel />
          <div className="photo-copy photo-plate absolute inset-0 z-[3] flex flex-col justify-end p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Watch</p>
            <p className="font-display text-3xl text-risk">{diseasePrediction.riskLevel}</p>
            <p className="mt-1 flex items-center gap-1 text-[13px]">
              Spray window <ArrowRight className="size-3" />
            </p>
          </div>
        </Link>

        <Link to="/markets" className="photo group relative h-56 overflow-hidden md:h-72">
          <PhotoReel />
          <div className="photo-copy photo-plate absolute inset-0 z-[3] flex flex-col justify-end p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Sell</p>
            <p className="font-display text-3xl">{sell.town.split(" ")[0]}</p>
            <p className="num mt-1 text-[15px]">KES {sell.netRevenuePerBag.toLocaleString()}</p>
          </div>
        </Link>

        <Link to="/financing" className="photo group relative h-56 overflow-hidden md:h-72">
          <PhotoReel />
          <div className="photo-copy photo-plate absolute inset-0 z-[3] flex flex-col justify-end p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Credit</p>
            <p className="num text-4xl">{creditReadinessScore}</p>
            <p className="mt-1 text-[13px]">{lender.institutionType}</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
