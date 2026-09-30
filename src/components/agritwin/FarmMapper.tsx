import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = { lat: number; lng: number };

const COUNTY_CENTER: Record<string, [number, number]> = {
  Kiambu: [-1.146, 36.91],
  "Murang'a": [-0.721, 37.153],
  Nyeri: [-0.437, 36.951],
  Nakuru: [-0.303, 36.08],
  "Uasin Gishu": [0.514, 35.27],
  "Trans Nzoia": [1.017, 34.995],
  Machakos: [-1.518, 37.263],
  Meru: [0.047, 37.648],
};

function acresFromPoints(points: MapPoint[]) {
  if (points.length < 3) return 0;
  const R = 6378137;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area +=
      ((b.lng - a.lng) * Math.PI) /
      180 *
      (2 + Math.sin((a.lat * Math.PI) / 180) + Math.sin((b.lat * Math.PI) / 180));
  }
  const sqm = Math.abs((area * R * R) / 2);
  return Math.round(Math.max(0.1, sqm / 4046.8564224) * 10) / 10;
}

export function toRelativePolygon(points: MapPoint[]): Array<[number, number]> {
  if (points.length < 3) return [];
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const dLat = maxLat - minLat || 1;
  const dLng = maxLng - minLng || 1;
  return points.map((p) => [(p.lng - minLng) / dLng, 1 - (p.lat - minLat) / dLat]);
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const drawnRef = useRef<LayerGroup | null>(null);
  const pointsRef = useRef(points);
  const onChangeRef = useRef(onChange);
  pointsRef.current = points;
  onChangeRef.current = onChange;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let cancelled = false;
    let resizeId = 0;

    import("leaflet").then((mod) => {
      if (cancelled || !wrapRef.current) return;
      const L = mod.default;
      const center = COUNTY_CENTER[county] || COUNTY_CENTER.Kiambu;
      const map = L.map(wrapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(center, 15);

      const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      });
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Tiles &copy; Esri",
        },
      );

      streets.addTo(map);
      L.control.layers({ Map: streets, Satellite: satellite }, undefined, { position: "topright" }).addTo(map);

      const drawn = L.layerGroup().addTo(map);
      drawnRef.current = drawn;
      mapRef.current = map;

      map.on("click", (e) => {
        onChangeRef.current([...pointsRef.current, { lat: e.latlng.lat, lng: e.latlng.lng }]);
      });

      const pts = pointsRef.current;
      if (pts.length >= 2) {
        L.polygon(
          pts.map((p) => [p.lat, p.lng] as [number, number]),
          { color: "#c9a227", weight: 2, fillColor: "#c9a227", fillOpacity: 0.28 },
        ).addTo(drawn);
      }
      pts.forEach((p) => {
        L.circleMarker([p.lat, p.lng], {
          radius: 6,
          color: "#14120e",
          weight: 1,
          fillColor: "#f1eadc",
          fillOpacity: 1,
        }).addTo(drawn);
      });

      resizeId = window.setTimeout(() => map.invalidateSize(), 120);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(resizeId);
      mapRef.current?.remove();
      mapRef.current = null;
      drawnRef.current = null;
    };
  }, [county]);

  useEffect(() => {
    const map = mapRef.current;
    const drawn = drawnRef.current;
    if (!map || !drawn) return;
    import("leaflet").then((mod) => {
      const L = mod.default;
      const current = mapRef.current;
      const group = drawnRef.current;
      if (!current || !group) return;
      group.clearLayers();
      if (points.length === 0) return;
      if (points.length >= 2) {
        L.polygon(
          points.map((p) => [p.lat, p.lng] as [number, number]),
          {
            color: "#c9a227",
            weight: 2,
            fillColor: "#c9a227",
            fillOpacity: 0.28,
          },
        ).addTo(group);
      }
      points.forEach((p) => {
        L.circleMarker([p.lat, p.lng], {
          radius: 6,
          color: "#14120e",
          weight: 1,
          fillColor: "#f1eadc",
          fillOpacity: 1,
        }).addTo(group);
      });
    });
  }, [points]);

  const acres = acresFromPoints(points);

  return (
    <div className="space-y-2">
      <div ref={wrapRef} className="z-0 h-[62vh] min-h-[320px] cursor-crosshair bg-[#1c1913] md:h-[70vh]" />
      <div className="flex items-center justify-between px-4 text-[12px] md:px-0">
        <span className="num text-foreground">{acres ? `${acres} ac` : "Tap the map — 3+ corners"}</span>
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
