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
  MOCK_ACTIVITIES,
  MOCK_ALERTS,
  MOCK_DISEASE_PREDICTION,
  MOCK_FARM,
  MOCK_FARMER_PROFILE,
  MOCK_LEAF_DIAGNOSES,
  MOCK_MARKET_PRICES,
  MOCK_SACCO_OPTIONS,
  MOCK_WEATHER,
  MOCK_ZONES,
} from "@/lib/agritwin/mock-data";

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

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function FarmStateProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<FarmerProfile>(MOCK_FARMER_PROFILE);
  const [twin, setTwin] = useState<DigitalTwinFarm>(MOCK_FARM);
  const [zones, setZones] = useState<CropZone[]>(MOCK_ZONES);
  const [weather] = useState<WeatherForecast>(MOCK_WEATHER);
  const [diseasePrediction] = useState<DiseasePrediction>(MOCK_DISEASE_PREDICTION);
  const [diagnoses, setDiagnoses] = useState<LeafDiagnosis[]>(MOCK_LEAF_DIAGNOSES);
  const [markets] = useState<KenyanMarketPrice[]>(MOCK_MARKET_PRICES);
  const [saccoOptions] = useState<SaccoLoanOption[]>(MOCK_SACCO_OPTIONS);
  const [alerts, setAlerts] = useState<FarmAlert[]>(MOCK_ALERTS);
  const [activities, setActivities] = useState<ActivityLog[]>(MOCK_ACTIVITIES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setProfile(parseJson(localStorage.getItem(`${STORAGE_PREFIX}profile`), MOCK_FARMER_PROFILE));
      const parsedTwin = parseJson(localStorage.getItem(`${STORAGE_PREFIX}twin`), MOCK_FARM);
      setTwin({
        ...MOCK_FARM,
        ...parsedTwin,
        mapped: parsedTwin.mapped ?? true,
        primaryCrop: parsedTwin.primaryCrop ?? MOCK_FARM.primaryCrop,
      });
      setZones(parseJson(localStorage.getItem(`${STORAGE_PREFIX}zones`), MOCK_ZONES));
      setDiagnoses(parseJson(localStorage.getItem(`${STORAGE_PREFIX}diagnoses`), MOCK_LEAF_DIAGNOSES));
      setAlerts(parseJson(localStorage.getItem(`${STORAGE_PREFIX}alerts`), MOCK_ALERTS));
      setActivities(parseJson(localStorage.getItem(`${STORAGE_PREFIX}activities`), MOCK_ACTIVITIES));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}profile`, JSON.stringify(profile));
    } catch {}
  }, [hydrated, profile]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}twin`, JSON.stringify(twin));
    } catch {}
  }, [hydrated, twin]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}zones`, JSON.stringify(zones));
    } catch {}
  }, [hydrated, zones]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}diagnoses`, JSON.stringify(diagnoses));
    } catch {}
  }, [hydrated, diagnoses]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}alerts`, JSON.stringify(alerts));
    } catch {}
  }, [hydrated, alerts]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}activities`, JSON.stringify(activities));
    } catch {}
  }, [hydrated, activities]);

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
      farmName: input.farmName,
      totalAcres: input.acres,
      perimeterMeters: Math.round(Math.sqrt(input.acres) * 250),
      soilType: "Mapped from Sentinel-2",
      lastSatelliteSync: `${now} EAT`,
      mapped: true,
      primaryCrop: input.crop,
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
    setProfile(MOCK_FARMER_PROFILE);
    setTwin(MOCK_FARM);
    setZones(MOCK_ZONES);
    setDiagnoses(MOCK_LEAF_DIAGNOSES);
    setAlerts(MOCK_ALERTS);
    setActivities(MOCK_ACTIVITIES);
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
