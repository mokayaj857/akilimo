import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFarmState } from "@/hooks/use-farm-state";
import { analyzeCropImage, type CropScanResult } from "@/lib/agritwin/crop-scan.functions";

function readFileAsJpegDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 1280;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not read image"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not open that file"));
    };
    img.src = url;
  });
}

export function CropScan() {
  const analyze = useServerFn(analyzeCropImage);
  const { addDiagnosis, updateTwin } = useFarmState();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CropScanResult | null>(null);
  const [fail, setFail] = useState<string | null>(null);

  async function run(file: File) {
    setBusy(true);
    setResult(null);
    setFail(null);
    try {
      const image_data_url = await readFileAsJpegDataUrl(file);
      setPreview(image_data_url);
      const reading = await analyze({ data: { image_data_url } });
      setResult(reading);
      addDiagnosis({
        id: `scan-${Date.now()}`,
        timestamp: new Date().toISOString(),
        imageUrl: image_data_url,
        cropIdentified: reading.cropIdentified,
        diseaseIdentified: reading.diseaseIdentified,
        confidenceScore: reading.confidenceScore,
        severity: reading.severity,
        symptomsObserved: reading.symptomsObserved?.length
          ? reading.symptomsObserved
          : [reading.notes || "Read from photo"],
        prescribedTreatment: {
          chemical: "Follow PCPB label for this crop",
          dosage: "Scout first; spray only if needed",
          organicAlternative: "Remove infected leaves; improve air flow",
          applicationIntervalDays: 10,
          safetyPrecautions: "Gloves and mask if you spray.",
        },
      });
      if (reading.cropCommonName) updateTwin({ primaryCrop: reading.cropCommonName });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not read that photo.";
      setFail(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void run(file);
  }

  return (
    <div className="mx-4 mt-4 mb-8 md:mx-7">
      <div className="flex items-center justify-between gap-4 border border-border bg-card px-4 py-3">
        <p className="font-display text-xl leading-none">Leaf</p>
        <div className="flex gap-2">
          <Button disabled={busy} onClick={() => cameraRef.current?.click()}>
            Scan
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
            Upload
          </Button>
        </div>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />

      {busy && (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Looking at the leaf…
        </p>
      )}

      {fail && <p className="mt-3 text-[13px] text-risk">{fail}</p>}

      {preview && (
        <img src={preview} alt="" className="mt-3 h-40 w-full object-cover sm:h-52" />
      )}

      {result && (
        <div className="mt-3 border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Disease</p>
          <p className="font-display mt-2 text-3xl leading-none">{result.diseaseIdentified}</p>
          {result.cropCommonName && (
            <p className="mt-2 text-[13px] text-muted-foreground">{result.cropCommonName}</p>
          )}
          {result.notes && <p className="mt-3 text-[15px] leading-snug">{result.notes}</p>}
        </div>
      )}
    </div>
  );
}
