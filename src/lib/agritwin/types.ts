export type LanguageCode = "en" | "sw" | "kik" | "luo" | "kal";

export interface FarmerProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  nationalId: string;
  county: string;
  subCounty: string;
  ward: string;
  preferredLanguage: LanguageCode;
  saccoMembership?: string;
  memberNumber?: string;
  avatarUrl: string;
  experienceYears: number;
}

export interface CropZone {
  id: string;
  name: string;
  cropName: string;
  variety: string;
  acres: number;
  plantingDate: string;
  expectedHarvestDate: string;
  growthStage: "Seedling" | "Vegetative" | "Flowering" | "Grain Filling" | "Maturity" | "Harvested";
  healthScore: number; // 0-100
  ndviScore: number; // 0-1
  ndreScore: number; // 0-1
  soilMoisturePercent: number;
  soilTemperatureC: number;
  nitrogenStatus: "Deficient" | "Optimal" | "Excess";
  irrigationMethod: "Drip" | "Sprinkler" | "Rainfed";
  polygonCoordinates: [number, number][]; // Relative coordinates for 2D/3D map
}

export interface FarmInfrastructure {
  id: string;
  name: string;
  type: "Farmhouse" | "Greenhouse" | "Water Tank" | "Borehole" | "Solar Pump" | "Storage Barn" | "Compost Pit";
  location: [number, number];
  capacity?: string;
  status: "Operational" | "Maintenance Needed" | "Offline";
}

export interface DigitalTwinFarm {
  id: string;
  farmName: string;
  totalAcres: number;
  perimeterMeters: number;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  soilType: string;
  primaryWaterSource: string;
  lastSatelliteSync: string;
  lastIoTSync: string;
  infrastructure: FarmInfrastructure[];
  mapped: boolean;
  primaryCrop: string;
}

export interface WeatherForecast {
  temperature: number;
  feelsLike: number;
  humidityPercent: number;
  windSpeedKmh: number;
  precipitationChance: number;
  rainForecastMmNext3Days: number;
  forecastSummary: string;
  uvIndex: number;
  evapotranspirationMm: number;
  dailyForecast: Array<{
    day: string;
    date: string;
    tempHigh: number;
    tempLow: number;
    rainProb: number;
    condition: "Sunny" | "Partly Cloudy" | "Rain" | "Showers" | "Thunderstorm";
  }>;
}

export interface DiseasePrediction {
  id: string;
  diseaseName: string;
  crop: string;
  affectedZoneId: string;
  affectedZoneName: string;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  riskPercentage: number;
  preSymptomaticWarning: boolean;
  environmentalTriggers: string[];
  recommendedActions: {
    immediate: string[];
    preventive: string[];
    pcpbApprovedInputs: Array<{
      commercialName: string;
      activeIngredient: string;
      dosagePer20LKnapsack: string;
      preHarvestIntervalDays: number;
      estimatedCostKes: number;
    }>;
    culturalPractices: string[];
  };
  detectedDate: string;
}

export interface LeafDiagnosis {
  id: string;
  timestamp: string;
  imageUrl: string;
  cropIdentified: string;
  diseaseIdentified: string;
  confidenceScore: number;
  severity: "Mild" | "Moderate" | "Severe";
  symptomsObserved: string[];
  prescribedTreatment: {
    chemical: string;
    dosage: string;
    organicAlternative: string;
    applicationIntervalDays: number;
    safetyPrecautions: string;
  };
}

export interface KenyanMarketPrice {
  id: string;
  marketName: string;
  town: string;
  county: string;
  commodity: string;
  unit: string; // e.g., "90kg bag", "1kg", "Crate"
  priceKes: number;
  priceChange7DayPercent: number;
  transportCostKesPerUnit: number;
  distanceKm: number;
  netRevenuePerBag: number;
  isTopRecommendation?: boolean;
  marketDay: string;
  verifiedWholesaleBuyers: Array<{
    name: string;
    phone: string;
    businessName: string;
    verifiedBadge: boolean;
  }>;
}

export interface SaccoLoanOption {
  id: string;
  institutionName: string;
  institutionType: "SACCO" | "Bank" | "Cooperative";
  productName: string;
  category: "Input Loan" | "Asset Financing" | "Emergency Advance" | "Warehouse Receipt";
  interestRateAnnualPercent: number;
  maxAmountKes: number;
  repaymentTermMonths: number;
  gracePeriodMonths: number;
  requiresCollateral: boolean;
  digitalTwinCreditDiscount: number; // e.g. 1.5% off for high health score
  profileMatchPercent: number;
  isRecommended?: boolean;
  features: string[];
  eligibilityCriteria: string[];
}

export interface FarmAlert {
  id: string;
  title: string;
  message: string;
  category: "Disease" | "Weather" | "Soil" | "Market" | "Finance";
  severity: "info" | "warning" | "critical";
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  category: "Planting" | "Fertilizer" | "Spraying" | "Irrigation" | "Harvest" | "Sales";
  description: string;
  zoneName: string;
  costKes?: number;
  recordedBy: string;
}
