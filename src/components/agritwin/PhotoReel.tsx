import { useEffect, useRef, useState } from "react";
import { STOCK } from "@/lib/agritwin/imagery";

function pick(pool: string[], avoid?: string) {
  if (pool.length < 2) return pool[0] || "";
  let next = pool[Math.floor(Math.random() * pool.length)];
  for (let i = 0; i < 6 && next === avoid; i++) {
    next = pool[Math.floor(Math.random() * pool.length)];
  }
  return next;
}

function load(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function PhotoReel({
  slides,
  className = "",
  ordered = false,
  onIndex,
  holdMs = 2600,
  sharp = false,
}: {
  slides?: string[];
  className?: string;
  ordered?: boolean;
  onIndex?: (i: number) => void;
  holdMs?: number;
  sharp?: boolean;
}) {
  const pool = slides && slides.length ? slides : STOCK;
  const poolKey = pool.join("|");
  const [base, setBase] = useState(pool[0] || "");
  const [cover, setCover] = useState<string | null>(null);
  const idxRef = useRef(0);
  const baseRef = useRef(pool[0] || "");
  const onIndexRef = useRef(onIndex);
  onIndexRef.current = onIndex;

  useEffect(() => {
    let live = true;

    const cycle = async () => {
      await load(pool[0]);
      if (!live) return;
      setBase(pool[0]);
      baseRef.current = pool[0];
      onIndexRef.current?.(0);

      const step = async () => {
        await new Promise((r) => window.setTimeout(r, holdMs));
        if (!live) return;

        let next: string;
        if (ordered) {
          idxRef.current = (idxRef.current + 1) % pool.length;
          next = pool[idxRef.current];
        } else {
          next = pick(pool, baseRef.current);
        }

        await load(next);
        if (!live) return;

        setCover(next);
        await new Promise((r) => window.setTimeout(r, 380));
        if (!live) return;

        setBase(next);
        baseRef.current = next;
        setCover(null);
        if (ordered) onIndexRef.current?.(idxRef.current);
        void step();
      };

      void step();
    };

    void cycle();
    return () => {
      live = false;
    };
  }, [holdMs, ordered, poolKey]);

  const layer = (src: string, on: boolean) => (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: on ? 1 : 0,
        filter: sharp
          ? "saturate(1.12) brightness(0.94)"
          : "blur(2px) saturate(1.08) brightness(1.02)",
        transform: sharp ? "scale(1.02)" : "scale(1.04)",
        transition: "opacity 0.38s linear",
      }}
    />
  );

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#1a1812] ${className}`}>
      {layer(base, true)}
      {cover ? layer(cover, true) : null}
    </div>
  );
}
