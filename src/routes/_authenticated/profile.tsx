import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/agritwin/LanguageSelector";
import { FarmPage } from "@/components/agritwin/Page";
import { Button } from "@/components/ui/button";
import { useFarmState } from "@/hooks/use-farm-state";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "Farm — Akilimo" }],
  }),
  component: ProfileRoute,
});

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border-0 border-b border-border bg-transparent py-2 text-[15px] outline-none focus:border-primary"
      />
    </label>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-border py-2.5 text-[14px] last:border-b-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={`min-w-0 text-right sm:text-left ${mono ? "num" : ""}`}>{v}</dd>
    </div>
  );
}

export function ProfileRoute() {
  const { profile, twin, updateProfile, resetToDefaults } = useFarmState();
  const [fullName, setFullName] = useState(profile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [nationalId, setNationalId] = useState(profile.nationalId);
  const [county, setCounty] = useState(profile.county);
  const [subCounty, setSubCounty] = useState(profile.subCounty);
  const [ward, setWard] = useState(profile.ward);
  const [saccoMembership, setSaccoMembership] = useState(profile.saccoMembership || "");
  const [memberNumber, setMemberNumber] = useState(profile.memberNumber || "");
  const [years, setYears] = useState(String(profile.experienceYears));

  useEffect(() => {
    setFullName(profile.fullName);
    setPhoneNumber(profile.phoneNumber);
    setNationalId(profile.nationalId);
    setCounty(profile.county);
    setSubCounty(profile.subCounty);
    setWard(profile.ward);
    setSaccoMembership(profile.saccoMembership || "");
    setMemberNumber(profile.memberNumber || "");
    setYears(String(profile.experienceYears));
  }, [profile]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const experienceYears = Number.parseInt(years, 10);
    updateProfile({
      fullName,
      phoneNumber,
      nationalId,
      county,
      subCounty,
      ward,
      saccoMembership,
      memberNumber,
      experienceYears: Number.isFinite(experienceYears) ? experienceYears : profile.experienceYears,
    });
    toast.success("Saved.");
  }

  return (
    <FarmPage
      title={fullName}
      action={
        <Link to="/onboarding" className="text-[13px] text-primary">
          Remap
        </Link>
      }
    >
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <img src={profile.avatarUrl} alt="" className="size-16 object-cover" />
        <div className="min-w-0">
          <p className="num text-[13px] text-primary">{nationalId}</p>
          <p className="mt-1 truncate text-[14px] text-muted-foreground">
            {phoneNumber} · {county}
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{profile.experienceYears} years farming</p>
        </div>
        <div className="ml-auto hidden text-right sm:block">
          <p className="num text-3xl leading-none">{twin.totalAcres}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">acres</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <form onSubmit={handleSave} className="space-y-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">You</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Name" value={fullName} onChange={setFullName} />
            </div>
            <Field label="Phone" value={phoneNumber} onChange={setPhoneNumber} />
            <Field label="National ID" value={nationalId} onChange={setNationalId} />
            <Field label="County" value={county} onChange={setCounty} />
            <Field label="Sub-county" value={subCounty} onChange={setSubCounty} />
            <Field label="Ward" value={ward} onChange={setWard} />
            <Field label="Years" value={years} onChange={setYears} type="number" />
            <Field label="SACCO" value={saccoMembership} onChange={setSaccoMembership} />
            <Field label="Member no." value={memberNumber} onChange={setMemberNumber} />
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Language</p>
            <LanguageSelector variant="cards" />
          </div>
          <Button type="submit">Save</Button>
        </form>

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Land</p>
          <p className="mt-2 text-[16px]">{twin.primaryCrop}</p>
          <dl className="mt-4">
            <Row k="Acres" v={String(twin.totalAcres)} mono />
            <Row k="Perimeter" v={`${twin.perimeterMeters} m`} mono />
            <Row k="Lat / lng" v={`${twin.latitude.toFixed(4)}, ${twin.longitude.toFixed(4)}`} mono />
            <Row k="Elevation" v={`${twin.elevationMeters} m`} mono />
            <Row k="Soil" v={twin.soilType} />
            <Row k="Water" v={twin.primaryWaterSource} />
          </dl>
          {twin.infrastructure.length > 0 && (
            <ul className="mt-6 space-y-1.5 border-t border-border pt-4 text-[13px]">
              {twin.infrastructure.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">{item.status}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="mt-6 text-[12px] text-muted-foreground hover:text-foreground"
            onClick={() => {
              resetToDefaults();
              toast.success("Demo farm restored.");
            }}
          >
            Reset demo
          </button>
        </div>
      </div>
    </FarmPage>
  );
}
