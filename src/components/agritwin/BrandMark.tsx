export function BrandMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <rect width="28" height="28" fill="#c9a227" />
      <path d="M5 20.5 L14 7.5 L23 20.5" fill="none" stroke="#1a160c" strokeWidth="2.2" />
      <path d="M9.2 20.5 L14 13.6 L18.8 20.5" fill="none" stroke="#1a160c" strokeWidth="1.6" />
    </svg>
  );
}
