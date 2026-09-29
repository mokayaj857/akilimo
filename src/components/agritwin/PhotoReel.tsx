import { useEffect, useRef, useState } from "react";

export type ReelSlide = { src: string; place: string };

export function PhotoReel({
  slides,
  intervalMs = 4200,
  onIndex,
}: {
  slides: ReelSlide[];
  intervalMs?: number;
  onIndex?: (i: number) => void;
}) {
  const [i, setI] = useState(0);
  const onIndexRef = useRef(onIndex);
  onIndexRef.current = onIndex;

  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
  }, [slides]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setI((n) => {
        const next = (n + 1) % slides.length;
        onIndexRef.current?.(next);
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs, slides.length]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={s.src}
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${s.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: idx === i ? 1 : 0,
            filter: "blur(3px) saturate(1.08) brightness(0.92)",
            transform: "scale(1.06)",
            transition: "opacity 1.4s ease",
          }}
        />
      ))}
    </div>
  );
}
