import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";

function readConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_* keys to .env and restart the dev server.");
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket || `${projectId}.firebasestorage.app`,
    messagingSenderId: messagingSenderId || "",
    appId,
    ...(measurementId ? { measurementId } : {}),
  };
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let analyticsStarted = false;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps()[0] ?? initializeApp(readConfig());
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function startFirebaseAnalytics() {
  if (analyticsStarted || typeof window === "undefined") return;
  analyticsStarted = true;
  void isSupported().then((ok) => {
    if (ok) getAnalytics(getFirebaseApp());
  });
}

export function firebaseAuthMessage(err: unknown): string {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: string }).code) : "";
  switch (code) {
    case "auth/invalid-email":
      return "That email is not valid.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Wrong email or password.";
    case "auth/email-already-in-use":
      return "That email already has a farm desk.";
    case "auth/weak-password":
      return "Use at least 6 characters for the password.";
    case "auth/too-many-requests":
      return "Too many tries. Wait a moment.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed.";
    case "auth/operation-not-allowed":
      return "Enable Email/Password (and Google if you use it) in Firebase Authentication → Sign-in method.";
    case "auth/unauthorized-domain":
      return "Add this site to Firebase Authentication → Settings → Authorized domains.";
    default:
      return err instanceof Error ? err.message : "Could not sign in.";
  }
}
