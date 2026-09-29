import { createFileRoute } from "@tanstack/react-router";
import { FarmPage } from "@/components/agritwin/Page";
import { Button } from "@/components/ui/button";
import { useFarmState } from "@/hooks/use-farm-state";
import { SHOT } from "@/lib/agritwin/imagery";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/crop-health")({
  head: () => ({
    meta: [{ title: "Disease — Akilimo" }],
  }),
  component: CropHealthRoute,
});

function CropHealthRoute() {
  const { diseasePrediction, twin } = useFarmState();
  const treat = diseasePrediction.recommendedActions.pcpbApprovedInputs[0];
  const name = diseasePrediction.diseaseName.split("(")[0].trim();

  return (
    <FarmPage title="Watch" bleed>
      <div className="photo relative h-[62vh] min-h-[360px] overflow-hidden md:h-[70vh]">
        <img src={SHOT.maizeLeaf} alt="" />
        <div className="photo-copy absolute inset-0 z-[3] flex flex-col justify-between p-5 pb-24 md:p-10 md:pb-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{twin.primaryCrop}</p>
          <div className="photo-plate -mx-5 px-5 pt-20 md:-mx-10 md:px-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-risk">Before the leaf shows it</p>
            <p className="num mt-2 text-6xl text-risk md:text-8xl">{diseasePrediction.riskPercentage}</p>
            <h1 className="font-display mt-3 text-4xl font-medium leading-[0.95] md:text-6xl">{name}</h1>
          </div>
        </div>
      </div>
      {treat && (
        <div className="mx-4 mt-4 flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between md:mx-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Spray window</p>
            <p className="mt-1 text-[16px]">{treat.commercialName}</p>
            <p className="num mt-1 text-[12px] text-muted-foreground">{treat.dosagePer20LKnapsack}</p>
          </div>
          <Button onClick={() => toast.success("Spray logged.")}>Log spray</Button>
        </div>
      )}
    </FarmPage>
  );
}
