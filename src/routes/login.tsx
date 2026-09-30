import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { toast } from "sonner";
import { AuthStage } from "@/components/agritwin/AuthStage";
import { LanguageSelector } from "@/components/agritwin/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { firebaseAuthMessage, getFirebaseAuth } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — Akilimo" }],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { user, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) {
      nav({ to: "/dashboard", replace: true });
    }
  }, [nav, ready, user]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      toast.success("Karibu.");
      nav({ to: "/dashboard", replace: true });
    } catch (err) {
      const text = firebaseAuthMessage(err);
      setFormError(text);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      toast.success("Karibu.");
      nav({ to: "/dashboard", replace: true });
    } catch (err) {
      const text = firebaseAuthMessage(err);
      setFormError(text);
      toast.error(text);
    } finally {
      setGoogleLoading(false);
    }
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
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-0 border-b border-white/20 bg-transparent py-2.5 text-[16px] outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="flex justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Password
            <Link to="/forgot-password" className="normal-case tracking-normal text-primary">
              Forgot
            </Link>
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-0 border-b border-white/20 bg-transparent py-2.5 text-[16px] outline-none focus:border-primary"
          />
        </label>
        <Button type="submit" disabled={loading || googleLoading} className="h-12 w-full text-[14px]">
          {loading ? "…" : "Open the map"}
        </Button>
        <Button type="button" variant="outline" disabled={loading || googleLoading} onClick={handleGoogle} className="h-11 w-full">
          {googleLoading ? "…" : "Continue with Google"}
        </Button>
        {formError && <p className="text-[13px] text-risk">{formError}</p>}
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
