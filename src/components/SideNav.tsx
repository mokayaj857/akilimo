import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bot, ChevronLeft, ChevronRight, CircleDollarSign, HeartPulse, LayoutDashboard, Map, Sprout, Store, User, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Item = { to: string; label: string; icon: LucideIcon };

const ITEMS: Item[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Digital twin", icon: Map },
  { to: "/crop-health", label: "Crop health", icon: HeartPulse },
  { to: "/markets", label: "Markets", icon: Store },
  { to: "/financing", label: "Financing", icon: CircleDollarSign },
  { to: "/assistant", label: "Ask AgriTwin", icon: Bot },
  { to: "/profile", label: "Farm profile", icon: User },
];

const STORAGE_KEY = "sidenav-collapsed";

export function SideNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1") setCollapsed(true);
    } catch {/* ignore */}
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch {/* ignore */}
      return next;
    });
  };

  // Expose width as a CSS variable so the layout can match its left padding.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty(
      "--sidenav-width",
      collapsed ? "5rem" : "15rem",
    );
  }, [collapsed]);

  const width = collapsed ? "5rem" : "15rem";

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="fixed bottom-3 left-3 top-3 z-30 hidden flex-col rounded-2xl border border-border bg-popover/80 shadow-2xl backdrop-blur-2xl md:flex"
    >
      {/* Brand + collapse */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        {!collapsed && (
          <span className="flex items-center gap-2 text-sm font-bold text-foreground"><Sprout className="size-5 text-primary" /> AgriTwin</span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-3 space-y-1">
        {ITEMS.map((it) => {
          const active = path === it.to || path.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              preload="intent"
              className={`relative flex items-center gap-3 rounded-2xl h-11 px-3 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidenav-active-bg"
                  className="absolute inset-0 rounded-2xl bg-primary shadow-[0_4px_18px_-2px_hsla(152,55%,45%,0.45)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`relative z-10 size-[18px] shrink-0 ${
                    active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.4 : 2}
              />
              {!collapsed && (
                <span
                  className={`relative z-10 truncate ${
                    active ? "text-primary-foreground" : "text-foreground/80"
                  }`}
                >
                  {it.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}