import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  RefreshCw,
  Save,
  User,
} from "lucide-react";
import { FarmPage, SectionTitle } from "@/components/agritwin/Page";
import { Button } from "@/components/ui/button";
import { useFarmState } from "@/hooks/use-farm-state";
import { LanguageSelector } from "@/components/agritwin/LanguageSelector";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Settings — Akilimo" },
      {
        name: "description",
        content: "Manage farmer identification, SACCO memberships, farm coordinates, and preferred language.",
      },
    ],
  }),
  component: ProfileRoute,
});

export function ProfileRoute() {
  const { profile, twin, updateProfile, resetToDefaults } = useFarmState();

  const [fullName, setFullName] = useState(profile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [county, setCounty] = useState(profile.county);
  const [subCounty, setSubCounty] = useState(profile.subCounty);
  const [saccoMembership, setSaccoMembership] = useState(profile.saccoMembership || "");
  const [memberNumber, setMemberNumber] = useState(profile.memberNumber || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      phoneNumber,
      county,
      subCounty,
      saccoMembership,
      memberNumber,
    });
    toast.success("Profile updated.");
  };

  return (
    <FarmPage
      title="Farm"
      action={
        <Link to="/onboarding" className="text-[12px] text-primary">
          Remap
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <SectionTitle title="Farmer Identification" />

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-black/30 p-2.5 text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Phone (M-Pesa)</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-border bg-black/30 p-2.5 text-foreground"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">County</label>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full rounded-xl border border-border bg-black/30 p-2.5 text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Sub-County</label>
                <input
                  type="text"
                  value={subCounty}
                  onChange={(e) => setSubCounty(e.target.value)}
                  className="w-full rounded-xl border border-border bg-black/30 p-2.5 text-foreground"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">SACCO</label>
                <input
                  type="text"
                  value={saccoMembership}
                  onChange={(e) => setSaccoMembership(e.target.value)}
                  className="w-full rounded-xl border border-border bg-black/30 p-2.5 text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Member ID</label>
                <input
                  type="text"
                  value={memberNumber}
                  onChange={(e) => setMemberNumber(e.target.value)}
                  className="w-full rounded-xl border border-border bg-black/30 p-2.5 text-foreground"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <label className="block text-[11px] font-medium text-muted-foreground mb-2">Preferred Language</label>
              <LanguageSelector variant="cards" />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="size-3.5 mr-1.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Right Info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs">
            <SectionTitle title="Farm Boundary" />
            <div className="space-y-1.5 text-muted-foreground text-[11px]">
              <div className="flex justify-between">
                <span>Holding:</span>
                <strong className="text-foreground">{twin.farmName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Acreage:</span>
                <strong className="text-foreground">{twin.totalAcres} Acres</strong>
              </div>
              <div className="flex justify-between">
                <span>Soil:</span>
                <strong className="text-foreground">{twin.soilType}</strong>
              </div>
              <div className="flex justify-between">
                <span>Water:</span>
                <strong className="text-foreground">{twin.primaryWaterSource}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs">
            <SectionTitle title="Demo Reset" />
            <p className="text-muted-foreground text-[11px]">
              Restore demonstration values for Kijani Farm Kiambu.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToDefaults();
                toast.success("Demonstration farm restored.");
              }}
              className="w-full rounded-xl text-xs font-semibold border-border"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              <span>Reset to Demo Data</span>
            </Button>
          </div>
        </div>
      </div>
    </FarmPage>
  );
}
