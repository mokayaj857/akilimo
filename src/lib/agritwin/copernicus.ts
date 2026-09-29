/**
 * Copernicus Sentinel Hub Process API Client & Evalscripts
 * Dataspace Copernicus STAC & Process API Service for Akilimo
 */

export const COPERNICUS_PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process";

// Copernicus Dataspace Sentinel Hub Bearer Token provided for Akilimo
export const COPERNICUS_TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJYVUh3VWZKaHVDVWo0X3k4ZF8xM0hxWXBYMFdwdDd2anhob2FPLUxzREZFIn0.eyJleHAiOjE3ODk1Nzk4NjUsImlhdCI6MTc4OTU3ODA2NSwiYXV0aF90aW1lIjoxNzg5NTc4MDYyLCJqdGkiOiJvbnJ0YWM6ZGUzZmJmYjItNWU0My1jZTRmLTMxNTEtOWZjNGI0ZjkyYWYzIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5kYXRhc3BhY2UuY29wZXJuaWN1cy5ldS9hdXRoL3JlYWxtcy9DRFNFIiwic3ViIjoiODNiNGUxZGMtM2IxMS00MTJhLWJlNmQtNWE4MmNjZjQyNTNhIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoic2gtMmQwNzc5MTctZWU2ZS00MjhlLTg2YmQtZWYzZjllZTRlMmUxIiwic2lkIjoiZjllNzY3MGYtZjg0OS05ZjUzLTVjZjAtNTU5NzFiMmU5ZWU0IiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vc2hhcHBzLmRhdGFzcGFjZS5jb3Blcm5pY3VzLmV1Il0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUgdXNlci1jb250ZXh0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm9yZ2FuaXphdGlvbnMiOlsiZGVmYXVsdC04M2I0ZTFkYy0zYjExLTQxMmEtYmU2ZC01YTgyY2NmNDI1M2EiXSwibmFtZSI6ImpvaG4gbW9rYXlhIiwidXNlcl9jb250ZXh0X2lkIjoiNGU2NTEwYjYtZWZjZS00YWZlLWE5YjQtYzQzMzFmYzc0ODViIiwiY29udGV4dF9yb2xlcyI6e30sImNvbnRleHRfZ3JvdXBzIjpbIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvY29wZXJuaWN1c19nZW5lcmFsLyIsIi9vcmdhbml6YXRpb25zL2RlZmF1bHQtODNiNGUxZGMtM2IxMS00MTJhLWJlNmQtNWE4MmNjZjQyNTNhL3JlZ3VsYXJfdXNlci8iXSwicHJlZmVycmVkX3VzZXJuYW1lIjoibW9rYXlhajg1N0BnbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoiam9obiIsInVzZXJfY29udGV4dCI6ImRlZmF1bHQtODNiNGUxZGMtM2IxMS00MTJhLWJlNmQtNWE4MmNjZjQyNTNhIiwiZmFtaWx5X25hbWUiOiJtb2theWEiLCJlbWFpbCI6Im1va2F5YWo4NTdAZ21haWwuY29tIn0.WtMQ604UaGLf310wC9OtQX0jVcj2vD_xxRnTbx5Xy7zp_Lh7sr2uxoCtWkBmIs9gUWG_hokiJBOT_dN1BP70k90r3vCg3xchWpnBD3xbLJlAic4iaSlgAP81vv7T6O7elboPN-9QvB6ujnZzVDI2XpueSG-klyV1HaoOb6QWrDM-C5FFhf70TrojVDO22sXibm6pCCHmdQ1-FJGtR5BNDCa6kgtjNF1aR27r_bW1-W7EhYeGNeMuRJUj2lpDTjHeeE-_JBmU_gi-96yrMAwO-2IdrXG-yLwM4_bA86gyhQFVHQltUXJ7c6TBMRfxl7pdmE1MnSKtLoSj-4RwOW7SWw";

export const COPERNICUS_STAC_URL = "https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search";

export type CopernicusLayerType = "TRUE_COLOR" | "NDVI" | "NDRE" | "NDWI" | "FALSE_COLOR";

export interface CopernicusLocationPreset {
  id: string;
  name: string;
  region: string;
  country: string;
  bbox: [number, number, number, number]; // [minX, minY, maxX, maxY]
  description: string;
}

export const COPERNICUS_PRESETS: CopernicusLocationPreset[] = [
  {
    id: "kiambu-farm",
    name: "Akilimo Kiambu Plot (Block A/B)",
    region: "Kiambu / Ruiru County",
    country: "Kenya",
    bbox: [36.885, -1.165, 36.935, -1.125],
    description: "High-potential volcanic soil with coffee, avocado, and maize rotation.",
  },
  {
    id: "nakuru-basin",
    name: "Nakuru Rift Valley Agricultural Belt",
    region: "Rift Valley Basin",
    country: "Kenya",
    bbox: [36.03, -0.32, 36.08, -0.27],
    description: "Commercial cereal, horticultural, and livestock corridor.",
  },
  {
    id: "meru-slopes",
    name: "Mt. Kenya Slopes / Meru Farmlands",
    region: "Meru County",
    country: "Kenya",
    bbox: [37.62, 0.02, 37.67, 0.07],
    description: "Intensive smallholder tea, macadamia, and legume cultivation.",
  },
  {
    id: "copernicus-sample",
    name: "Copernicus Calibration Tile (Rome/Lazio)",
    region: "Rome",
    country: "Italy",
    bbox: [12.44693, 41.870072, 12.541001, 41.917096],
    description: "Standard ESA Sentinel reference scene for optical baseline validation.",
  },
];

export const EVALSCRIPTS: Record<CopernicusLayerType, string> = {
  // True Color RGB (B04, B03, B02 with natural gain)
  TRUE_COLOR: `//VERSION=3
function setup() {
  return {
    input: ["B02", "B03", "B04"],
    output: { bands: 3 }
  };
}

function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
}`,

  // NDVI Normalized Difference Vegetation Index: (B08 - B04)/(B08 + B04)
  // Maps to standard agricultural colormap: red (bare/stressed) -> yellow -> emerald green (dense crop)
  NDVI: `//VERSION=3
function setup() {
  return {
    input: ["B04", "B08"],
    output: { bands: 3 }
  };
}

function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04 + 0.0001);
  
  if (ndvi < 0.1) return [0.7, 0.15, 0.15]; // Bare soil / rock / cloud shadow
  if (ndvi < 0.25) return [0.85, 0.45, 0.1]; // Low vigor / dry residue
  if (ndvi < 0.45) return [0.95, 0.8, 0.1]; // Moderate vigor / emerging canopy
  if (ndvi < 0.65) return [0.35, 0.75, 0.2]; // Good vegetative growth
  return [0.05, 0.6, 0.2]; // Dense healthy canopy
}`,

  // NDRE Red Edge Chlorophyll Index: (B08 - B05)/(B08 + B05)
  // Highly sensitive to nitrogen content and pre-symptomatic blight stress in dense canopies
  NDRE: `//VERSION=3
function setup() {
  return {
    input: ["B05", "B08"],
    output: { bands: 3 }
  };
}

function evaluatePixel(sample) {
  let ndre = (sample.B08 - sample.B05) / (sample.B08 + sample.B05 + 0.0001);
  
  if (ndre < 0.15) return [0.8, 0.2, 0.2]; // Severe chlorophyll breakdown / blight
  if (ndre < 0.3) return [0.9, 0.6, 0.1]; // Moderate nitrogen deficiency
  if (ndre < 0.45) return [0.4, 0.7, 0.2]; // Healthy photosynthetic activity
  return [0.1, 0.55, 0.35]; // Optimal chlorophyll saturation
}`,

  // NDWI Normalized Difference Water Index: (B08 - B11)/(B08 + B11)
  // Measures canopy moisture and soil hydration status
  NDWI: `//VERSION=3
function setup() {
  return {
    input: ["B08", "B11"],
    output: { bands: 3 }
  };
}

function evaluatePixel(sample) {
  let ndwi = (sample.B08 - sample.B11) / (sample.B08 + sample.B11 + 0.0001);
  
  if (ndwi < -0.2) return [0.7, 0.4, 0.2]; // Drought / water deficit
  if (ndwi < 0.0) return [0.8, 0.75, 0.5]; // Moderate moisture
  if (ndwi < 0.2) return [0.2, 0.6, 0.8]; // Well-hydrated canopy
  return [0.05, 0.35, 0.9]; // High moisture / saturated soil
}`,

  // False Color NIR/Red/Green: [B08, B04, B03]
  // Standard agronomic composite where healthy vegetation reflects brightly in red tones
  FALSE_COLOR: `//VERSION=3
function setup() {
  return {
    input: ["B03", "B04", "B08"],
    output: { bands: 3 }
  };
}

function evaluatePixel(sample) {
  return [2.5 * sample.B08, 2.5 * sample.B04, 2.5 * sample.B03];
}`,
};

export interface FetchSentinelImageParams {
  bbox: [number, number, number, number];
  layer: CopernicusLayerType;
  from?: string;
  to?: string;
  width?: number;
  height?: number;
}

export interface SentinelImageResult {
  dataUrl: string;
  width: number;
  height: number;
  bbox: [number, number, number, number];
  layer: CopernicusLayerType;
  acquisitionDate: string;
  cloudCoverEstimate: number;
  constellation: string;
  resolutionMeters: number;
}

export interface STACSceneItem {
  id: string;
  datetime: string;
  cloudCover: number;
  bbox: [number, number, number, number];
  collection: string;
  platform?: string;
  sunElevation?: number;
  thumbnailUrl?: string;
}

export interface STACSearchResponse {
  type: string;
  features: Array<{
    id: string;
    bbox: [number, number, number, number];
    properties: {
      datetime: string;
      "eo:cloud_cover"?: number;
      "sat:relative_orbit"?: number;
      "view:sun_elevation"?: number;
      platform?: string;
      constellation?: string;
    };
    assets?: Record<string, { href: string; type?: string; title?: string }>;
  }>;
  context?: {
    returned: number;
    limit: number;
  };
}
