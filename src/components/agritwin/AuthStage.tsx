import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/agritwin/BrandMark";
import { PhotoReel } from "@/components/agritwin/PhotoReel";

export function AuthStage({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="dark relative min-h-app overflow-hidden bg-background text-foreground">
      <PhotoReel />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#120f0a] via-[#120f0a]/25 to-[#120f0a]/35" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-1/2 bg-gradient-to-r from-[#120f0a]/50 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-app max-w-[1180px] flex-col justify-between gap-12 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:px-10 lg:py-12">
        <div className="max-w-xl">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <BrandMark className="size-9" />
            <span className="font-display text-2xl font-medium">Akilimo</span>
          </Link>
          <p className="mt-12 text-[11px] uppercase tracking-[0.24em] text-primary">{kicker}</p>
          <h1 className="photo-copy font-display mt-3 text-5xl font-medium leading-[0.92] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-[#f7f1e4]/55">
            <span>Map</span>
            <span>Watch</span>
            <span>Sell</span>
            <span>Credit</span>
          </div>
        </div>

        <div className="relative w-full max-w-md self-stretch lg:self-end">
          <div className="absolute -top-3 right-6 hidden h-14 w-14 rotate-6 border border-primary/50 bg-primary/15 lg:grid place-items-center">
            <span className="font-display text-[11px] leading-none text-primary">KE</span>
          </div>
          <div className="border border-white/12 bg-[#14120e]/78 p-6 shadow-[0_30px_80px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
