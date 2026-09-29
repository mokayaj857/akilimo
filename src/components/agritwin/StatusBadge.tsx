export function LiveIndicator({ text = "Live" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-success">
      <span className="size-1.5 rounded-full bg-success" />
      {text}
    </span>
  );
}

export function RiskBadge({ level }: { level: "Low" | "Moderate" | "High" | "Critical" }) {
  const styles = {
    Low: "text-success",
    Moderate: "text-warning",
    High: "text-risk",
    Critical: "text-risk",
  };

  return <span className={`num text-[12px] ${styles[level]}`}>{level}</span>;
}
