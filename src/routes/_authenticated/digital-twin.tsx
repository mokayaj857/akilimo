import { createFileRoute, Link } from "@tanstack/react-router";
import { Farm3DViewer } from "@/components/agritwin/Farm3DViewer";
import { PhotoReel } from "@/components/agritwin/PhotoReel";
import { useFarmState } from "@/hooks/use-farm-state";

export const Route = createFileRoute("/_authenticated/digital-twin")({
  head: () => ({
    meta: [{ title: "Twin — Akilimo" }],
  }),
  component: DigitalTwinRoute,
});

function DigitalTwinRoute() {
  const { twin, zones } = useFarmState();

  return (
    <main className="space-y-0">
      <div className="photo relative h-44 overflow-hidden md:h-56">
        <PhotoReel />
        <div className="photo-copy photo-plate absolute inset-0 z-[3] flex items-end justify-between p-5 md:px-8 md:pb-6">
          <div>
            <h1 className="font-display text-4xl font-medium md:text-5xl">Twin</h1>
            <p className="mt-1 text-[14px]">
              {twin.primaryCrop} · <span className="num">{twin.totalAcres} ac</span>
            </p>
          </div>
          <Link to="/onboarding" className="border border-white/30 bg-black/40 px-3 py-1.5 text-[12px] backdrop-blur-sm">
            Remap
          </Link>
        </div>
      </div>
      <Farm3DViewer twin={twin} zones={zones} />
    </main>
  );
}
