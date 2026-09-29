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
import { cropShot } from "@/lib/agritwin/imagery";

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
  const { diseasePrediction, twin } = useFarmState();

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
    document.documentElement.style.setProperty("--sidenav-width", collapsed ? "3.75rem" : "12.5rem");
  }, [collapsed]);

  const width = collapsed ? "3.75rem" : "12.5rem";

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-[#16130f] md:flex overflow-hidden"
    >
      <div className={`flex h-14 items-center border-b border-border ${collapsed ? "justify-center" : "justify-between px-3"}`}>
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 text-foreground">
            <BrandMark className="size-7" />
            <span className="font-display text-[1.05rem] font-semibold leading-none">Akilimo</span>
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid size-7 place-items-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-px">
        {ITEMS.map((it) => {
          const active = path === it.to || path.startsWith(`${it.to}/`);
          const Icon = it.icon;
          const warn = it.to === "/crop-health" && diseasePrediction.riskLevel === "High";
          return (
            <Link
              key={it.to}
              to={it.to}
              preload="intent"
              className={`flex h-8 items-center gap-2.5 px-2 text-[13px] ${
                collapsed ? "justify-center" : ""
              } ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="size-3.5 shrink-0" strokeWidth={active ? 2.2 : 1.7} />
              {!collapsed && <span className="truncate">{it.label}</span>}
              {!collapsed && warn && <span className="ml-auto num text-[10px]">!</span>}
            </Link>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="photo relative h-28 overflow-hidden">
          <img src={cropShot(twin.primaryCrop)} alt="" />
          <div className="shade absolute inset-0" />
          <p className="absolute bottom-2 left-3 font-display text-sm">{twin.farmName.split(" ")[0]}</p>
        </div>
      )}
    </motion.aside>
  );
}
