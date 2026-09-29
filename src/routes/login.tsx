import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthStage } from "@/components/agritwin/AuthStage";
import { LanguageSelector } from "@/components/agritwin/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [{ title: "Sign in — Akilimo" }],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { user, ready } = useAuth();
  const [identifier, setIdentifier] = useState("+254 712 345 678");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) {
      nav({ to: "/dashboard", replace: true });
    }
  }, [nav, ready, user]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Karibu.");
      nav({ to: "/onboarding", replace: true });
    }, 500);
  }

  return (
    <AuthStage kicker="Season desk" title={<>Karibu.<br />The field is live.</>}>
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Gate pass</p>
            <p className="font-display mt-1 text-3xl leading-none">Enter</p>
          </div>
          <LanguageSelector variant="button" />
        </div>

        <label className="block space-y-1.5">
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Phone</span>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border-0 border-b border-white/20 bg-transparent py-2.5 text-[16px] outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="flex justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            PIN
            <Link to="/forgot-password" className="normal-case tracking-normal text-primary">
              Forgot
            </Link>
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-0 border-b border-white/20 bg-transparent py-2.5 text-[16px] outline-none focus:border-primary"
          />
        </label>
        <Button type="submit" disabled={loading} className="h-12 w-full text-[14px]">
          {loading ? "…" : "Open the map"}
        </Button>
        <p className="text-[13px] text-muted-foreground">
          First season?{" "}
          <Link to="/signup" className="text-primary">
            Register the farm
          </Link>
        </p>
      </form>
    </AuthStage>
  );
}
