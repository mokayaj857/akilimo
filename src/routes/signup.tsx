import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthStage } from "@/components/agritwin/AuthStage";
import { LanguageSelector } from "@/components/agritwin/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { firebaseAuthMessage, getFirebaseAuth } from "@/lib/firebase";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your Akilimo account" },
      {
        name: "description",
        content: "Create your Akilimo account to monitor crop health, understand markets, and build your farm's digital twin.",
      },
      { property: "og:title", content: "Create your Akilimo account" },
      {
        property: "og:description",
        content: "Start using AI-powered crop insights, market intelligence, and farm financing recommendations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [navigate, ready, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (fullName.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      toast.error("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Your passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the terms to continue.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      await updateProfile(cred.user, { displayName: fullName.trim() });
      toast.success("Karibu.");
      navigate({ to: "/onboarding", replace: true });
    } catch (err) {
      toast.error(firebaseAuthMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      toast.success("Karibu.");
      navigate({ to: "/onboarding", replace: true });
    } catch (err) {
      toast.error(firebaseAuthMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  if (!ready) {
    return (
      <AuthStage kicker="New farm" title={<>One plot.<br />One twin.</>}>
        <p className="text-sm text-muted-foreground">Preparing your account…</p>
      </AuthStage>
    );
  }

  return (
    <AuthStage kicker="New farm" title={<>Draw the line.<br />Own the season.</>}>
        <div>
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Ledger</p>
              <p className="font-display mt-1 text-3xl leading-none">Register</p>
            </div>
            <LanguageSelector variant="button" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthField label="Name">
              <input
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full bg-transparent pb-2 pt-1 text-[15px] outline-none"
              />
            </AuthField>

            <AuthField label="Email">
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent pb-2 pt-1 text-[15px] outline-none"
              />
            </AuthField>

            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField label="Password">
                <div className="flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent pb-2 pt-1 text-[15px] outline-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="size-8 shrink-0 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                  </Button>
                </div>
              </AuthField>

              <AuthField label="Repeat">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-transparent pb-2 pt-1 text-[15px] outline-none"
                />
              </AuthField>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-0.5 size-3.5 shrink-0 accent-primary"
              />
              <span>I agree to the farm desk terms.</span>
            </label>

            <Button disabled={loading} type="submit" className="h-12 w-full">
              {loading && <Loader2 className="animate-spin" aria-hidden />}
              {loading ? "…" : "Start mapping"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <div className="h-px flex-1 bg-white/15" />
            <span>or</span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={googleLoading}
            onClick={handleGoogle}
            className="h-11 w-full"
          >
            {googleLoading ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {googleLoading ? "…" : "Continue with Google"}
          </Button>

          <p className="pt-6 text-[13px] text-muted-foreground">
            Already on the desk?{" "}
            <Link to="/login" className="text-primary">
              Sign in
            </Link>
          </p>
        </div>
    </AuthStage>
  );
}

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block border-b border-white/20 focus-within:border-primary">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}