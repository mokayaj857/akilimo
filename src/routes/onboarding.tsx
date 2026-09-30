import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/agritwin/BrandMark";
import { FarmerPhoto } from "@/components/agritwin/FarmerPhoto";
import { FarmMapper, acresFromPoints, toRelativePolygon, type MapPoint } from "@/components/agritwin/FarmMapper";
import { PhotoReel } from "@/components/agritwin/PhotoReel";
import { Button } from "@/components/ui/button";
import { useFarmState } from "@/hooks/use-farm-state";
import { CROP_SHOT } from "@/lib/agritwin/imagery";
import { getFirebaseAuth } from "@/lib/firebase";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Map farm — Akilimo" }],
  }),
  component: OnboardingRoute,
});

const CROPS = Object.keys(CROP_SHOT);

function OnboardingRoute() {
  const navigate = useNavigate();
  const { profile, twin, updateProfile, generateTwin } = useFarmState();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState(profile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [county, setCounty] = useState(profile.county);
  const [farmName, setFarmName] = useState(twin.farmName);
  const [crop, setCrop] = useState(twin.primaryCrop || "White Maize");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    setFullName(profile.fullName);
    setPhoneNumber(profile.phoneNumber);
    setCounty(profile.county);
    setAvatarUrl(profile.avatarUrl);
  }, [profile.fullName, profile.phoneNumber, profile.county, profile.avatarUrl]);

  useEffect(() => {
    setFarmName(twin.farmName);
    if (twin.primaryCrop) setCrop(twin.primaryCrop);
  }, [twin.farmName, twin.primaryCrop]);

  const acres = acresFromPoints(points);

  const finish = () => {
    setBuilding(true);
    updateProfile({ fullName, phoneNumber, county, avatarUrl });
    const fbUser = getFirebaseAuth().currentUser;
    if (fbUser && fullName.trim()) {
      void updateFirebaseProfile(fbUser, { displayName: fullName.trim() });
    }
    generateTwin({
      farmName,
      county,
      crop,
      acres: acres || 3.8,
      polygon: toRelativePolygon(points),
      latitude: points.length
        ? points.reduce((s, p) => s + p.lat, 0) / points.length
        : undefined,
      longitude: points.length
        ? points.reduce((s, p) => s + p.lng, 0) / points.length
        : undefined,
    });
    setTimeout(() => {
      setBuilding(false);
      setStep(3);
    }, 1400);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="absolute left-0 right-0 top-0 z-20 flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <BrandMark className="size-7" />
          <span className="font-display text-lg">Akilimo</span>
        </div>
        <span className="num text-[12px] text-primary">{step} / 3</span>
      </header>

      {step === 1 && (
        <div className="grid min-h-screen lg:grid-cols-2">
          <div className="photo relative hidden min-h-[40vh] lg:block">
            <PhotoReel />
            <p className="photo-copy photo-plate absolute inset-x-0 bottom-0 z-[3] px-10 pb-10 pt-24 font-display text-5xl leading-none">{crop}</p>
          </div>
          <div className="flex flex-col justify-center px-5 pb-10 pt-20 sm:px-12">
            <h1 className="font-display text-4xl font-medium">Who farms</h1>
            <div className="mt-8 space-y-5">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Photo</p>
                <div className="flex items-center gap-3">
                  <FarmerPhoto url={avatarUrl} name={fullName} sizeClass="size-16" onChange={setAvatarUrl} />
                  <p className="text-[13px] text-muted-foreground">Tap to use your photo, not a stock portrait.</p>
                </div>
              </div>
              <label className="block space-y-1">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border-0 border-b border-border bg-transparent py-2 text-[16px] outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Phone</span>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border-0 border-b border-border bg-transparent py-2 text-[16px] outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">County</span>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full border-0 border-b border-border bg-transparent py-2 text-[16px]"
                >
                  {["", "Kiambu", "Murang'a", "Nyeri", "Nakuru", "Uasin Gishu", "Trans Nzoia", "Machakos", "Meru"].map(
                    (c) => (
                      <option key={c || "none"} value={c}>
                        {c || "Select county"}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Farm</span>
                <input
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full border-0 border-b border-border bg-transparent py-2 text-[16px] outline-none focus:border-primary"
                />
              </label>
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Crop</p>
                <div className="grid grid-cols-5 gap-2">
                  {CROPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCrop(c)}
                      className={`photo photo-clear relative h-16 overflow-hidden ${crop === c ? "ring-2 ring-primary" : "opacity-70"}`}
                      title={c}
                    >
                      <img src={CROP_SHOT[c]} alt={c} />
                    </button>
                  ))}
                </div>
              </div>
              <Button className="h-11 w-full" onClick={() => setStep(2)}>
                Draw on the map
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex min-h-screen flex-col pt-14">
          <div className="flex items-end justify-between px-4 py-4 md:px-8">
            <div>
              <h1 className="font-display text-3xl font-medium md:text-4xl">Map the farm</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">{county} · tap each corner on the map</p>
            </div>
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="size-3.5" />
            </Button>
          </div>
          <div className="flex-1 px-0 md:px-8 pb-6">
            <FarmMapper county={county} points={points} onChange={setPoints} />
            <div className="mt-4 flex justify-end px-4 md:px-0">
              <Button onClick={finish} disabled={points.length < 3 || building} className="h-11 px-8">
                {building ? "Growing the twin…" : "Make the twin"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="relative min-h-screen">
          <PhotoReel />
          <div className="absolute inset-0 bg-[#120f0a]/32" />
          <div className="photo-copy relative z-10 flex min-h-screen flex-col justify-end p-6 pb-16 md:p-16">
            <p className="text-[12px] uppercase tracking-[0.2em] text-primary">Live</p>
            <h1 className="font-display mt-2 text-5xl font-medium md:text-7xl">{twin.totalAcres} acres</h1>
            <p className="mt-3 text-lg">{twin.primaryCrop} · Sentinel-2</p>
            <Button className="mt-8 h-11 w-fit px-8" onClick={() => navigate({ to: "/dashboard" })}>
              Open desk
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
