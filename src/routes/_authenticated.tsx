import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Box, HeartPulse, LayoutDashboard, Menu, Store, User, Wallet, X } from "lucide-react";
import { FarmerPhoto } from "@/components/agritwin/FarmerPhoto";
import { LanguageSelector } from "@/components/agritwin/LanguageSelector";
import { SideNav } from "@/components/SideNav";
import { useAuth } from "@/hooks/use-auth";
import { useFarmState } from "@/hooks/use-farm-state";
import { firstNameFrom } from "@/lib/farmer-identity";

export const Route = createFileRoute("/_authenticated")({ component: AuthedLayout });

const NAV = [
  { to: "/dashboard", label: "Desk", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Twin", icon: Box },
  { to: "/crop-health", label: "Disease", icon: HeartPulse },
  { to: "/markets", label: "Sell", icon: Store },
  { to: "/financing", label: "Credit", icon: Wallet },
] as const;

function AuthedLayout() {
  const nav = useNavigate();
  const { profile } = useFarmState();
  const { user, ready } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const welcome = firstNameFrom(profile.fullName || user?.displayName, user?.email);

  useEffect(() => {
    if (ready && !user) nav({ to: "/login", replace: true });
  }, [nav, ready, user]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="dark min-h-app bg-background text-foreground pb-20 md:pb-0 selection:bg-primary selection:text-primary-foreground">
      <SideNav />

      <div className="md:pl-[var(--sidenav-width,12.5rem)]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-[#16130f]/80 px-3 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="grid size-8 place-items-center text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            <p className="font-display text-sm text-foreground">Welcome {welcome}</p>
          </div>

          <p className="hidden font-display text-[15px] text-foreground md:block">Welcome {welcome}</p>

          <div className="flex items-center gap-1">
            <LanguageSelector variant="button" />
            <Link to="/profile" aria-label="Open farm profile" className="ml-1 flex items-center gap-2 pl-1">
              <FarmerPhoto url={profile.avatarUrl} name={profile.fullName || welcome} sizeClass="size-6" />
              <span className="hidden sm:inline text-[12px]">{welcome}</span>
            </Link>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 top-12 z-40 bg-background p-4 md:hidden">
            <nav className="space-y-1">
              {[...NAV, { to: "/profile", label: "Farm", icon: User }].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 text-[13px]"
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <Outlet />
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border bg-[#16130f] pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Main"
      >
        {NAV.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[12px] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-4" strokeWidth={active ? 2.2 : 1.6} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
