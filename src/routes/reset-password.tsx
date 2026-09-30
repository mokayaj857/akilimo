import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { firebaseAuthMessage, getFirebaseAuth } from "@/lib/firebase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Akilimo" }] }),
  component: ResetPassword,
});

function readOobCode() {
  if (typeof window === "undefined") return null;
  const query = new URLSearchParams(window.location.search);
  const fromQuery = query.get("oobCode");
  if (fromQuery) return fromQuery;
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash).get("oobCode");
}

function ResetPassword() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const oobCode = useMemo(() => readOobCode(), []);
  const [invalid, setInvalid] = useState(!oobCode);

  useEffect(() => {
    if (!readOobCode()) setInvalid(true);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const code = readOobCode();
    if (!code) {
      setInvalid(true);
      return;
    }
    if (pw.length < 8) return toast.error("Use at least 8 characters");
    if (pw !== confirm) return toast.error("Passwords don't match");
    setBusy(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), code, pw);
      setDone(true);
      setTimeout(() => nav({ to: "/login" }), 1400);
    } catch (err) {
      toast.error(firebaseAuthMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (invalid) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Link expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">This password reset link is invalid or has expired. Request a new one to continue.</p>
          <Link to="/forgot-password" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mx-auto mb-4">
            <CheckCircle2 className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
          <p className="mt-2 text-sm text-muted-foreground">Taking you to sign in…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <form onSubmit={save} className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose something at least 8 characters.</p>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" autoFocus
          className="mt-6 w-full rounded-2xl bg-card ring-1 ring-border px-4 py-3.5 text-sm outline-none" />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password"
          className="mt-3 w-full rounded-2xl bg-card ring-1 ring-border px-4 py-3.5 text-sm outline-none" />
        <button disabled={busy} className="mt-3 w-full rounded-2xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="size-4 animate-spin" />}
          Save password
        </button>
      </form>
    </div>
  );
}
