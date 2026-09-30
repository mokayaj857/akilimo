import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LayoutDashboard,
  Store,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/agritwin/BrandMark";
import { useFarmState } from "@/hooks/use-farm-state";

const ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Desk", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Twin", icon: Box },
  { to: "/crop-health", label: "Disease", icon: HeartPulse },
  { to: "/markets", label: "Sell", icon: Store },
  { to: "/financing", label: "Credit", icon: Wallet },
  { to: "/profile", label: "Farm", icon: User },
];

export function SideNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const { diseasePrediction } = useFarmState();

  useEffect(() => {
    try {
      if (localStorage.getItem("sidenav-collapsed") === "1") setCollapsed(true);
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("sidenav-collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--sidenav-width", collapsed ? "4.5rem" : "15rem");
  }, [collapsed]);

  const width = collapsed ? "4.5rem" : "15rem";

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className="fixed inset-y-0 left-0 z-30 hidden overflow-hidden border-r border-primary/35 bg-[#1c1810] shadow-[8px_0_32px_rgba(0,0,0,0.45)] md:flex md:flex-col"
    >
      <div className="h-1 w-full bg-primary" />

      <div
        className={`flex h-16 items-center border-b border-white/10 ${
          collapsed ? "justify-center" : "justify-between gap-2 px-3"
        }`}
      >
        {!collapsed && (
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5 text-foreground">
            <BrandMark className="size-9 shrink-0" />
            <span className="font-display text-[1.35rem] font-semibold leading-none tracking-tight">Akilimo</span>
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid size-10 place-items-center text-foreground hover:bg-primary hover:text-primary-foreground"
        >
          {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-3" aria-label="Farm">
        {ITEMS.map((it) => {
          const active = path === it.to || path.startsWith(`${it.to}/`);
          const Icon = it.icon;
          const warn = it.to === "/crop-health" && diseasePrediction.riskLevel === "High";
          return (
            <Link
              key={it.to}
              to={it.to}
              preload="intent"
              title={it.label}
              className={`group relative flex min-h-12 items-center gap-3 px-3 text-[17px] font-bold leading-none ${
                collapsed ? "justify-center px-0" : ""
              } ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-[#f1eadc] hover:bg-primary/20"
              }`}
            >
              {active && <span className="absolute inset-y-0 left-0 w-1 bg-[#1a160c]" />}
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.4 : 2} />
              {!collapsed && <span className="truncate">{it.label}</span>}
              {warn &&
                (collapsed ? (
                  <span className="absolute right-1 top-1 size-2.5 bg-risk" />
                ) : (
                  <span className="ml-auto grid size-7 place-items-center bg-risk text-[16px] font-bold text-white">
                    !
                  </span>
                ))}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
