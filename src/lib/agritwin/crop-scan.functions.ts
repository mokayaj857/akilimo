import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CropScanResult = {
  cropIdentified: string;
  cropCommonName: string;
  diseaseIdentified: string;
  confidenceScore: number;
  severity: "Mild" | "Moderate" | "Severe";
  symptomsObserved: string[];
  notes: string;
};

const ScanSchema = z.object({
  cropIdentified: z.string().min(1),
  cropCommonName: z.string().min(1),
  diseaseIdentified: z.string().min(1),
  confidenceScore: z.number().min(0).max(100).optional(),
  severity: z.enum(["Mild", "Moderate", "Severe"]).optional(),
  symptomsObserved: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

function readingFromModel(json: unknown): CropScanResult {
  const message = (json as { choices?: Array<{ message?: Record<string, unknown> }> })?.choices?.[0]
    ?.message;
  const args = (message?.tool_calls as Array<{ function?: { arguments?: unknown } }> | undefined)?.[0]
    ?.function?.arguments;
  let parsed: unknown;
  if (typeof args === "string") parsed = JSON.parse(args);
  else if (args && typeof args === "object") parsed = args;
  else if (typeof message?.content === "string") {
    const match = message.content.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  }
  const data = ScanSchema.parse(parsed);
  return {
    cropIdentified: data.cropIdentified,
    cropCommonName: data.cropCommonName,
    diseaseIdentified: data.diseaseIdentified,
    confidenceScore: data.confidenceScore ?? 60,
    severity: data.severity ?? "Moderate",
    symptomsObserved: data.symptomsObserved ?? [],
    notes: data.notes ?? "",
  };
}

export const analyzeCropImage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ image_data_url: z.string().min(40).max(5_000_000) }).parse(d))
  .handler(async ({ data }): Promise<CropScanResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured on this desk.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You look at a farm photo. Name the crop. Then name the disease or pest in plain farmer language. If the plant looks healthy, say Healthy. One short note. Return only the tool call.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What crop is this? What disease is on it? Speak simply.",
              },
              { type: "image_url", image_url: { url: data.image_data_url } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "crop_scan",
              description: "Crop and disease from a leaf photo",
              parameters: {
                type: "object",
                properties: {
                  cropIdentified: { type: "string" },
                  cropCommonName: { type: "string", description: "Short crop name" },
                  diseaseIdentified: {
                    type: "string",
                    description: "Disease name, or Healthy",
                  },
                  confidenceScore: { type: "number" },
                  severity: { type: "string", enum: ["Mild", "Moderate", "Severe"] },
                  symptomsObserved: { type: "array", items: { type: "string" } },
                  notes: { type: "string", description: "One short sentence" },
                },
                required: ["cropIdentified", "cropCommonName", "diseaseIdentified"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "crop_scan" } },
      }),
    });

    if (res.status === 429) throw new Error("AI is busy. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits are finished.");
    if (!res.ok) throw new Error("Could not read that photo.");

    const json = await res.json();
    try {
      return readingFromModel(json);
    } catch {
      throw new Error("No reading from that photo.");
    }
  });
