import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/agritwin/BrandMark";
import { LanguageSelector } from "@/components/agritwin/LanguageSelector";
import { PhotoReel } from "@/components/agritwin/PhotoReel";
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
    <div className="dark relative min-h-screen overflow-hidden bg-background text-foreground">
      <PhotoReel />
      <div className="absolute inset-0 z-[1] bg-[#120f0a]/28" />
      <div className="shade-side absolute inset-0 z-[1]" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between p-6 sm:p-10 lg:flex-row lg:items-end">
        <div className="max-w-xl pb-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <BrandMark className="size-9" />
            <span className="font-display text-2xl font-medium">Akilimo</span>
          </Link>
          <h1 className="photo-copy font-display mt-10 text-5xl font-medium leading-[0.95] sm:text-6xl lg:text-7xl">
            See the farm
            <br />
            from above.
          </h1>
        </div>

        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 border border-white/10 bg-[#14120e]/80 p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl">Enter</p>
            <LanguageSelector variant="button" />
          </div>
          <label className="block space-y-1.5">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Phone</span>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border-0 border-b border-white/20 bg-transparent py-2 text-[15px] outline-none focus:border-primary"
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
              className="w-full border-0 border-b border-white/20 bg-transparent py-2 text-[15px] outline-none focus:border-primary"
            />
          </label>
          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? "…" : "Open the map"}
          </Button>
          <p className="text-[12px] text-muted-foreground">
            New?{" "}
            <Link to="/signup" className="text-primary">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
