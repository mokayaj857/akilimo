import { useEffect, useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BrandMark } from "@/components/agritwin/BrandMark";
import { PhotoReel } from "@/components/agritwin/PhotoReel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { getAllowedEmailDomain } from "@/lib/app-settings.functions";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
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
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const fetchAllowedDomain = useServerFn(getAllowedEmailDomain);
  const { data: allowedDomain } = useQuery({
    queryKey: ["allowed-email-domain"],
    queryFn: () => fetchAllowedDomain(),
    staleTime: 5 * 60_000,
  });

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
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: fullName.trim() },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    setConfirmationEmail(email.trim());
  }

  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    const domain = allowedDomain?.domain ?? undefined;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      ...(domain ? { extraParams: { hd: domain } } : {}),
    });
    if (result.error) {
      toast.error(result.error.message);
      setGoogleLoading(false);
    }
  }

  if (!ready) {
    return (
      <main className="dark grid min-h-app place-items-center bg-background px-6 text-foreground">
        <p className="text-sm text-muted-foreground">Preparing your account…</p>
      </main>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground grid lg:grid-cols-[1.15fr_0.85fr]">
      <aside className="photo relative hidden min-h-screen lg:block">
        <PhotoReel />
        <div className="absolute inset-0 bg-[#120f0a]/45" />
        <div className="photo-copy relative z-10 flex h-full flex-col justify-between p-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <BrandMark className="size-8" />
            <span className="font-display text-xl">Akilimo</span>
          </Link>
          <p className="font-display text-5xl font-medium leading-[1.05] max-w-sm">
            Draw the boundary.
            <br />
            Own the season.
          </p>
        </div>
      </aside>

      <section className="flex flex-col justify-center px-6 py-10 sm:px-10">
        <Link to="/" className="mb-10 flex items-center gap-2 lg:hidden">
          <BrandMark className="size-7" />
          <span className="font-display font-semibold">Akilimo</span>
        </Link>

        <div className="w-full max-w-sm">
            {confirmationEmail ? (
              <div>
                <h2 className="font-display text-3xl font-semibold">Check inbox</h2>
                <div className="rule mt-3 w-16" />
                <p className="mt-4 text-[13px] text-muted-foreground">
                  Link sent to <span className="text-foreground">{confirmationEmail}</span>.
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-3xl font-semibold">Register</h2>
                <div className="rule mt-3 w-16 mb-6" />

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AuthField label="Name">
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full bg-transparent pb-2 pt-1 text-[13px] outline-none"
                    />
                  </AuthField>

                  <AuthField label="Email">
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent pb-2 pt-1 text-[13px] outline-none"
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
                          className="min-w-0 flex-1 bg-transparent pb-2 pt-1 text-[13px] outline-none"
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
                        className="w-full bg-transparent pb-2 pt-1 text-[13px] outline-none"
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
                    <span>Accept terms.</span>
                  </label>

                  <Button disabled={loading} type="submit" className="h-10 w-full">
                    {loading && <Loader2 className="animate-spin" aria-hidden />}
                    {loading ? "…" : "Create"}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={googleLoading}
                  onClick={handleGoogle}
                  className="h-10 w-full"
                >
                  {googleLoading ? <Loader2 className="animate-spin" aria-hidden /> : <span aria-hidden>G</span>}
                  {googleLoading ? "…" : "Google"}
                </Button>

                <p className="pt-6 text-[12px] text-muted-foreground">
                  Have an account?{" "}
                  <Link to="/login" className="text-primary">
                    Sign in
                  </Link>
                </p>
              </>
            )}
        </div>
      </section>
    </div>
  );
}

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block border-b border-border focus-within:border-primary">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}