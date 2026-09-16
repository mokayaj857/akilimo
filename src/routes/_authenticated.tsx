import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Bot, HeartPulse, LayoutDashboard, Map, Store, User } from "lucide-react";
import { useEffect } from "react";
import DarkVeil from "@/components/DarkVeil";
import { SideNav } from "@/components/SideNav";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({ component: AuthedLayout });

const mobileItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Twin", icon: Map },
  { to: "/crop-health", label: "Health", icon: HeartPulse },
  { to: "/markets", label: "Markets", icon: Store },
  { to: "/assistant", label: "Ask", icon: Bot },
] as const;

function AuthedLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login", replace: true });
  }, [navigate, ready, user]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  if (!ready || !user) {
    return <main className="dark grid min-h-app place-items-center bg-background text-foreground"><p className="text-sm text-muted-foreground">Preparing your farm…</p></main>;
  }

  return (
    <div className="dark relative isolate min-h-app bg-background pb-24 text-foreground md:pb-0">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <DarkVeil hueShift={140} noiseIntensity={0} scanlineIntensity={0} speed={0.28} scanlineFrequency={0} warpAmount={0} resolutionScale={0.8} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_72%,transparent),color-mix(in_oklab,var(--background)_92%,transparent))]" />
      </div>
      <SideNav />
      <div className="relative z-10 md:pl-[calc(var(--sidenav-width,15rem)+1.5rem)]">
        <header className="flex h-16 items-center justify-between px-5 md:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold md:hidden"><span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Map className="size-4" /></span>AgriTwin</Link>
          <div className="hidden md:block" />
          <Link to="/profile" aria-label="Open farm profile" className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"><User className="size-4" /></Link>
        </header>
        <Outlet />
      </div>
      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-border bg-popover/90 p-1.5 shadow-2xl backdrop-blur-2xl md:hidden" aria-label="Main navigation">
        {mobileItems.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return <Link key={item.to} to={item.to} className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Icon className="size-4" />{item.label}</Link>;
        })}
      </nav>
    </div>
  );
}