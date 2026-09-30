import type { FarmerProfile } from "@/lib/agritwin/types";

export function firstNameFrom(fullName: string | null | undefined, email?: string | null) {
  const named = fullName?.trim();
  if (named) return named.split(/\s+/)[0];
  const local = email?.split("@")[0]?.trim();
  if (local) return local;
  return "farmer";
}

export function initialsFrom(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function isDummyFarmer(profile: FarmerProfile) {
  return (
    profile.id === "farmer-001" ||
    profile.fullName === "John Mokaya" ||
    profile.avatarUrl.includes("photo-1534528741775")
  );
}

export function isDummyFarmName(farmName: string, farmId: string) {
  return farmId === "farm-kiambu-01" || farmName === "Kijani Ridge Smallholding";
}

export function emptyFarmer(id: string): FarmerProfile {
  return {
    id,
    fullName: "",
    phoneNumber: "",
    nationalId: "",
    county: "",
    subCounty: "",
    ward: "",
    preferredLanguage: "en",
    saccoMembership: "",
    memberNumber: "",
    avatarUrl: "",
    experienceYears: 0,
  };
}

export function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 320;
      const scale = Math.min(max / img.width, max / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read photo."));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read photo."));
    };
    img.src = url;
  });
}
