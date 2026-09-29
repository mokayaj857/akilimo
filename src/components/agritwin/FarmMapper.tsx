import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchCopernicusSentinelImage } from "@/lib/copernicus.functions";
import { COPERNICUS_PRESETS } from "@/lib/agritwin/copernicus";
import { SHOT } from "@/lib/agritwin/imagery";

export type MapPoint = { x: number; y: number };

const COUNTY_PRESET: Record<string, string> = {
  Kiambu: "kiambu-farm",
  Nakuru: "nakuru-basin",
  Meru: "meru-slopes",
  "Murang'a": "kiambu-farm",
  Nyeri: "kiambu-farm",
  "Uasin Gishu": "nakuru-basin",
  "Trans Nzoia": "nakuru-basin",
  Machakos: "kiambu-farm",
};

function acresFromPoints(points: MapPoint[]) {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.round(Math.max(0.4, Math.abs(area) * 9.2) * 10) / 10;
}

export function FarmMapper({
  county,
  points,
  onChange,
}: {
  county: string;
  points: MapPoint[];
  onChange: (points: MapPoint[]) => void;
}) {
  const fetchImage = useServerFn(fetchCopernicusSentinelImage);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const preset =
      COPERNICUS_PRESETS.find((p) => p.id === (COUNTY_PRESET[county] || "kiambu-farm")) ||
      COPERNICUS_PRESETS[0];
    let cancelled = false;
    fetchImage({
      data: { bbox: preset.bbox, layer: "TRUE_COLOR", width: 720, height: 520 },
    })
      .then((res) => {
        if (!cancelled && res?.dataUrl) setImage(res.dataUrl);
      })
      .catch(() => {
        if (!cancelled) setImage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [county, fetchImage]);

  const acres = acresFromPoints(points);

  const addPoint = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    onChange([...points, { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }]);
  };

  const polygon = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * 100} ${p.y * 100}`)
    .concat(points.length > 2 ? ["Z"] : [])
    .join(" ");

  return (
    <div className="space-y-2">
      <div
        ref={wrapRef}
        onClick={addPoint}
        className="relative h-[62vh] min-h-[320px] cursor-crosshair overflow-hidden bg-[#1a2314] md:h-[70vh]"
      >
        {image ? (
          <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <img src={SHOT.aerial} alt="" className="absolute inset-0 size-full object-cover saturate-[1.15]" />
        )}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          {points.length > 1 && (
            <path d={polygon} fill="rgba(201,162,39,0.28)" stroke="#c9a227" strokeWidth="0.7" />
          )}
          {points.map((p, i) => (
            <circle key={i} cx={p.x * 100} cy={p.y * 100} r="1.2" fill="#f1eadc" />
          ))}
        </svg>
        <p className="pointer-events-none absolute left-4 top-4 bg-black/50 px-3 py-1.5 text-[12px] tracking-wide backdrop-blur-sm">
          Tap corners
        </p>
      </div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="num text-foreground">{acres ? `${acres} ac` : "Need 3+ points"}</span>
        {points.length > 0 && (
          <button type="button" className="text-primary" onClick={() => onChange([])}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export { acresFromPoints };
