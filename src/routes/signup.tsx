import { useEffect, useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Check, Eye, EyeOff, Loader2, Sprout } from "lucide-react";
import { toast } from "sonner";

import DarkVeil from "@/components/DarkVeil";
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
      { title: "Create your AgriTwin account" },
      {
        name: "description",
        content: "Create your AgriTwin account to monitor crop health, understand markets, and build your farm's digital twin.",
      },
      { property: "og:title", content: "Create your AgriTwin account" },
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
      navigate({ to: "/dashboard", replace: true });
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
    <main className="dark relative min-h-app overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <DarkVeil
          hueShift={140}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.4}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklab,var(--background)_40%,transparent)_42%,var(--background)_100%)] md:bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--background)_60%,transparent)_58%,var(--background)_100%)]" />
      </div>

      <div className="relative z-10 grid min-h-app grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.05fr_1fr]">
        <section className="flex flex-col justify-end px-6 pb-5 pt-14 md:justify-center md:p-12 lg:p-20 xl:p-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-xl"
          >
            <div className="mb-4 flex items-center gap-2 text-primary">
              <Sprout className="size-5" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-widest">Farm intelligence</span>
            </div>
            <h1 className="text-5xl font-black uppercase leading-none md:text-7xl lg:text-8xl">
              Agri<br className="hidden md:block" />Twin
            </h1>
            <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
              See your farm clearly. Anticipate crop risk, find stronger markets, and discover financing built around your farm.
            </p>
          </motion.div>
        </section>

        <section className="flex flex-col justify-center px-6 pb-10 pt-2 md:p-10 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="w-full max-w-lg md:ml-auto md:rounded-3xl md:bg-card md:p-9 md:ring-1 md:ring-border md:backdrop-blur-2xl"
          >
            {confirmationEmail ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-7" aria-hidden />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">Check your inbox</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We sent a confirmation link to <span className="font-semibold text-foreground">{confirmationEmail}</span>.
                </p>
                <Button asChild variant="outline" className="mt-7 h-11 rounded-xl px-6">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <h2 className="text-2xl font-semibold">Create your farm account</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Your farm setup comes next and takes only a few minutes.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AuthField label="Full name">
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full bg-transparent pb-2 pt-1 text-base font-medium outline-none placeholder:text-muted-foreground/50"
                      placeholder="Your full name"
                    />
                  </AuthField>

                  <AuthField label="Email">
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent pb-2 pt-1 text-base font-medium outline-none placeholder:text-muted-foreground/50"
                      placeholder="you@example.com"
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
                          className="min-w-0 flex-1 bg-transparent pb-2 pt-1 text-base font-medium outline-none placeholder:text-muted-foreground/50"
                          placeholder="8+ characters"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword((visible) => !visible)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          title={showPassword ? "Hide password" : "Show password"}
                          className="size-8 shrink-0 rounded-full text-muted-foreground"
                        >
                          {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                        </Button>
                      </div>
                    </AuthField>

                    <AuthField label="Confirm password">
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full bg-transparent pb-2 pt-1 text-base font-medium outline-none placeholder:text-muted-foreground/50"
                        placeholder="Repeat password"
                      />
                    </AuthField>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="mt-0.5 size-4 shrink-0 accent-primary"
                    />
                    <span>I agree to the Terms of Service and Privacy Policy.</span>
                  </label>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="h-12 w-full rounded-2xl font-semibold shadow-lg transition-transform active:scale-[0.98]"
                  >
                    {loading && <Loader2 className="animate-spin" aria-hidden />}
                    {loading ? "Creating account…" : "Create account"}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={googleLoading}
                  onClick={handleGoogle}
                  className="h-12 w-full rounded-2xl bg-secondary font-semibold transition-transform active:scale-[0.98]"
                >
                  {googleLoading ? <Loader2 className="animate-spin" aria-hidden /> : <span aria-hidden className="text-base font-bold">G</span>}
                  {googleLoading ? "Opening Google…" : "Continue with Google"}
                </Button>

                <p className="pt-7 text-center text-sm text-muted-foreground">
                  Already growing with AgriTwin?{" "}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </section>
      </div>
    </main>
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