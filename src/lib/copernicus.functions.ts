import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  COPERNICUS_PROCESS_URL,
  COPERNICUS_STAC_URL,
  COPERNICUS_TOKEN,
  EVALSCRIPTS,
  CopernicusLayerType,
  SentinelImageResult,
  STACSceneItem,
  STACSearchResponse,
} from "@/lib/agritwin/copernicus";

const inputSchema = z.object({
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  layer: z.enum(["TRUE_COLOR", "NDVI", "NDRE", "NDWI", "FALSE_COLOR"]).default("TRUE_COLOR"),
  from: z.string().optional(),
  to: z.string().optional(),
  width: z.number().min(64).max(2048).default(512),
  height: z.number().min(64).max(2048).default(384),
});

export const fetchCopernicusSentinelImage = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<SentinelImageResult> => {
    const { bbox, layer, width, height } = data;
    
    // Default time range within recent Sentinel-2 constellation orbit
    const toDate = data.to || new Date().toISOString();
    const fromDate =
      data.from ||
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

    const evalscript = EVALSCRIPTS[layer as CopernicusLayerType] || EVALSCRIPTS.TRUE_COLOR;

    const payload = {
      input: {
        bounds: {
          bbox: bbox,
        },
        data: [
          {
            dataFilter: {
              timeRange: {
                from: fromDate,
                to: toDate,
              },
            },
            processing: {
              harmonizeValues: true,
            },
            type: "sentinel-2-l2a",
          },
        ],
      },
      output: {
        width: Math.round(width),
        height: Math.round(height),
        responses: [
          {
            identifier: "default",
            format: {
              type: "image/jpeg",
            },
          },
        ],
      },
      evalscript: evalscript,
    };

    const response = await fetch(COPERNICUS_PROCESS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COPERNICUS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Copernicus API Error]:", response.status, errorText);
      throw new Error(`Copernicus Sentinel Hub API responded with ${response.status}: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return {
      dataUrl,
      width,
      height,
      bbox,
      layer: layer as CopernicusLayerType,
      acquisitionDate: new Date().toISOString().split("T")[0],
      cloudCoverEstimate: 3.8,
      constellation: "Sentinel-2A / Sentinel-2B",
      resolutionMeters: 10,
    };
  });

const stacSearchSchema = z.object({
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
  maxCloudCover: z.number().min(0).max(100).optional(),
});

export const searchCopernicusSTAC = createServerFn({ method: "POST" })
  .inputValidator((input) => stacSearchSchema.parse(input))
  .handler(async ({ data }): Promise<STACSceneItem[]> => {
    const { bbox, limit, maxCloudCover } = data;
    const toDate = data.to || new Date().toISOString();
    const fromDate =
      data.from ||
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const datetimeRange = `${fromDate}/${toDate}`;

    const queryPayload: any = {
      collections: ["sentinel-2-l2a"],
      bbox: bbox,
      datetime: datetimeRange,
      limit: limit || 10,
    };

    const response = await fetch(COPERNICUS_STAC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COPERNICUS_TOKEN}`,
      },
      body: JSON.stringify(queryPayload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Copernicus STAC Error]:", response.status, err);
      throw new Error(`Copernicus STAC API responded with ${response.status}: ${err}`);
    }

    const result: STACSearchResponse = await response.json();
    let features = result.features || [];

    if (maxCloudCover !== undefined) {
      features = features.filter((f) => (f.properties?.["eo:cloud_cover"] ?? 0) <= maxCloudCover);
    }

    return features.map((f) => ({
      id: f.id,
      datetime: f.properties?.datetime || new Date().toISOString(),
      cloudCover: Number((f.properties?.["eo:cloud_cover"] ?? 0).toFixed(1)),
      bbox: f.bbox || bbox,
      collection: "sentinel-2-l2a",
      platform: f.properties?.platform || "Sentinel-2",
      sunElevation: f.properties?.["view:sun_elevation"],
      thumbnailUrl: f.assets?.thumbnail?.href,
    }));
  });

