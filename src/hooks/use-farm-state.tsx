import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ActivityLog,
  CropZone,
  DigitalTwinFarm,
  DiseasePrediction,
  FarmerProfile,
  KenyanMarketPrice,
  LeafDiagnosis,
  SaccoLoanOption,
  WeatherForecast,
  FarmAlert,
} from "@/lib/agritwin/types";
import {
  MOCK_DISEASE_PREDICTION,
  MOCK_MARKET_PRICES,
  MOCK_SACCO_OPTIONS,
  MOCK_WEATHER,
  MOCK_ZONES,
} from "@/lib/agritwin/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { emptyFarmer, isDummyFarmName, isDummyFarmer } from "@/lib/farmer-identity";

interface FarmStateContextType {
  profile: FarmerProfile;
  twin: DigitalTwinFarm;
  zones: CropZone[];
  weather: WeatherForecast;
  diseasePrediction: DiseasePrediction;
  diagnoses: LeafDiagnosis[];
  markets: KenyanMarketPrice[];
  saccoOptions: SaccoLoanOption[];
  alerts: FarmAlert[];
  activities: ActivityLog[];
  unreadAlertsCount: number;
  overallHealthScore: number;
  creditReadinessScore: number;
  updateProfile: (profile: Partial<FarmerProfile>) => void;
  updateTwin: (twin: Partial<DigitalTwinFarm>) => void;
  updateZone: (zoneId: string, updates: Partial<CropZone>) => void;
  addDiagnosis: (diagnosis: LeafDiagnosis) => void;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  addActivity: (activity: Omit<ActivityLog, "id" | "date">) => void;
    generateTwin: (input: {
      farmName: string;
      county: string;
      crop: string;
      acres: number;
      polygon: Array<[number, number]>;
      latitude?: number;
      longitude?: number;
    }) => void;
  resetToDefaults: () => void;
}

const FarmStateContext = createContext<FarmStateContextType | undefined>(undefined);

const STORAGE_PREFIX = "Akilimo_state_";

const EMPTY_FARM: DigitalTwinFarm = {
  id: "",
  farmName: "",
  totalAcres: 0,
  perimeterMeters: 0,
  latitude: 0,
  longitude: 0,
  elevationMeters: 0,
  soilType: "",
  primaryWaterSource: "",
  lastSatelliteSync: "",
  lastIoTSync: "",
  mapped: false,
  primaryCrop: "",
  infrastructure: [],
};

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function scopedKey(uid: string, part: string) {
  return `${STORAGE_PREFIX}${uid}_${part}`;
}

function readStored<T>(uid: string, part: string, fallback: T): T {
  const scoped = parseJson(localStorage.getItem(scopedKey(uid, part)), null as T | null);
  if (scoped != null) return scoped;
  return parseJson(localStorage.getItem(`${STORAGE_PREFIX}${part}`), fallback);
}

export function FarmStateProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<FarmerProfile>(emptyFarmer(""));
  const [twin, setTwin] = useState<DigitalTwinFarm>(EMPTY_FARM);
  const [zones, setZones] = useState<CropZone[]>([]);
  const [weather] = useState<WeatherForecast>(MOCK_WEATHER);
  const [diseasePrediction] = useState<DiseasePrediction>(MOCK_DISEASE_PREDICTION);
  const [diagnoses, setDiagnoses] = useState<LeafDiagnosis[]>([]);
  const [markets] = useState<KenyanMarketPrice[]>(MOCK_MARKET_PRICES);
  const [saccoOptions] = useState<SaccoLoanOption[]>(MOCK_SACCO_OPTIONS);
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const uid = user?.uid ?? "";
    try {
      if (!uid) {
        setProfile(emptyFarmer(""));
        setTwin(EMPTY_FARM);
        setZones([]);
        setDiagnoses([]);
        setAlerts([]);
        setActivities([]);
      } else {
        const loadedProfile = readStored(uid, "profile", emptyFarmer(uid));
        const seeded = isDummyFarmer(loadedProfile) ? emptyFarmer(uid) : loadedProfile;
        setProfile({
          ...seeded,
          id: uid,
          fullName: seeded.fullName.trim() || user?.displayName || user?.email?.split("@")[0] || "",
          avatarUrl: seeded.avatarUrl || user?.photoURL || "",
        });
        const loadedTwin = readStored(uid, "twin", EMPTY_FARM);
        const dummyTwin = !loadedTwin || isDummyFarmName(loadedTwin.farmName, loadedTwin.id);
        setTwin(dummyTwin ? EMPTY_FARM : { ...EMPTY_FARM, ...loadedTwin });
        const loadedZones = readStored(uid, "zones", [] as CropZone[]);
        setZones(!dummyTwin && Array.isArray(loadedZones) ? loadedZones : []);
        if (dummyTwin) {
          setDiagnoses([]);
          setAlerts([]);
          setActivities([]);
        } else {
          setDiagnoses(readStored(uid, "diagnoses", [] as LeafDiagnosis[]));
          setAlerts(readStored(uid, "alerts", [] as FarmAlert[]));
          setActivities(readStored(uid, "activities", [] as ActivityLog[]));
        }
      }
    } catch {
      setProfile(emptyFarmer(uid));
      setTwin(EMPTY_FARM);
    }
    setOwnerId(uid || null);
    setHydrated(true);
  }, [ready, user?.uid, user?.displayName, user?.email, user?.photoURL]);

  const persistForOwner = hydrated && ownerId === (user?.uid ?? null) && !!ownerId;

  useEffect(() => {
    if (!persistForOwner || !ownerId) return;
    try {
      localStorage.setItem(scopedKey(ownerId, "profile"), JSON.stringify(profile));
    } catch {}
  }, [persistForOwner, ownerId, profile]);

  useEffect(() => {
    if (!persistForOwner || !ownerId) return;
    try {
      localStorage.setItem(scopedKey(ownerId, "twin"), JSON.stringify(twin));
    } catch {}
  }, [persistForOwner, ownerId, twin]);

  useEffect(() => {
    if (!persistForOwner || !ownerId) return;
    try {
      localStorage.setItem(scopedKey(ownerId, "zones"), JSON.stringify(zones));
    } catch {}
  }, [persistForOwner, ownerId, zones]);

  useEffect(() => {
    if (!persistForOwner || !ownerId) return;
    try {
      localStorage.setItem(scopedKey(ownerId, "diagnoses"), JSON.stringify(diagnoses));
    } catch {}
  }, [persistForOwner, ownerId, diagnoses]);

  useEffect(() => {
    if (!persistForOwner || !ownerId) return;
    try {
      localStorage.setItem(scopedKey(ownerId, "alerts"), JSON.stringify(alerts));
    } catch {}
  }, [persistForOwner, ownerId, alerts]);

  useEffect(() => {
    if (!persistForOwner || !ownerId) return;
    try {
      localStorage.setItem(scopedKey(ownerId, "activities"), JSON.stringify(activities));
    } catch {}
  }, [persistForOwner, ownerId, activities]);

  const updateProfile = (updates: Partial<FarmerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateTwin = (updates: Partial<DigitalTwinFarm>) => {
    setTwin((prev) => ({ ...prev, ...updates }));
  };

  const updateZone = (zoneId: string, updates: Partial<CropZone>) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, ...updates } : z))
    );
  };

  const addDiagnosis = (diag: LeafDiagnosis) => {
    setDiagnoses((prev) => [diag, ...prev]);
  };

  const markAlertRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  };

  const markAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const addActivity = (act: Omit<ActivityLog, "id" | "date">) => {
    const newAct: ActivityLog = {
      ...act,
      id: `act-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const generateTwin = (input: {
    farmName: string;
    county: string;
    crop: string;
    acres: number;
    polygon: Array<[number, number]>;
    latitude?: number;
    longitude?: number;
  }) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    updateTwin({
      id: ownerId ? `farm-${ownerId}` : "farm-mapped",
      farmName: input.farmName,
      totalAcres: input.acres,
      perimeterMeters: Math.round(Math.sqrt(input.acres) * 250),
      soilType: "Mapped from Sentinel-2",
      lastSatelliteSync: `${now} EAT`,
      mapped: true,
      primaryCrop: input.crop,
      infrastructure: [],
      ...(typeof input.latitude === "number" ? { latitude: input.latitude } : {}),
      ...(typeof input.longitude === "number" ? { longitude: input.longitude } : {}),
    });
    setZones([
      {
        ...MOCK_ZONES[0],
        name: "Mapped plot",
        cropName: input.crop,
        acres: input.acres,
        polygonCoordinates: input.polygon.length >= 3 ? input.polygon : MOCK_ZONES[0].polygonCoordinates,
      },
    ]);
  };

  const resetToDefaults = () => {
    setProfile(emptyFarmer(ownerId || ""));
    setTwin(EMPTY_FARM);
    setZones([]);
    setDiagnoses([]);
    setAlerts([]);
    setActivities([]);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  const overallHealthScore = Math.round(
    zones.reduce((sum, z) => sum + z.healthScore * z.acres, 0) /
      Math.max(1, zones.reduce((sum, z) => sum + z.acres, 0))
  );

  // Credit Readiness based on crop health, acreage, experience, verified water
  const creditReadinessScore = Math.min(
    98,
    Math.round(
      overallHealthScore * 0.45 +
        Math.min(profile.experienceYears * 3, 25) +
        (twin.infrastructure.length >= 3 ? 15 : 8) +
        (twin.totalAcres >= 2 ? 15 : 10)
    )
  );

  return (
    <FarmStateContext.Provider
      value={{
        profile,
        twin,
        zones,
        weather,
        diseasePrediction,
        diagnoses,
        markets,
        saccoOptions,
        alerts,
        activities,
        unreadAlertsCount,
        overallHealthScore,
        creditReadinessScore,
        updateProfile,
        updateTwin,
        updateZone,
        addDiagnosis,
        markAlertRead,
        markAllAlertsRead,
        addActivity,
        generateTwin,
        resetToDefaults,
      }}
    >
      {children}
    </FarmStateContext.Provider>
  );
}

export function useFarmState() {
  const ctx = useContext(FarmStateContext);
  if (!ctx) {
    throw new Error("useFarmState must be used within a FarmStateProvider");
  }
  return ctx;
}
