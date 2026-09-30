import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, startFirebaseAnalytics } from "@/lib/firebase";

export type AuthUser = {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.uid,
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      startFirebaseAnalytics();
      const unsub = onAuthStateChanged(getFirebaseAuth(), (next) => {
        setUser(toAuthUser(next));
        setLoading(false);
      });
      return unsub;
    } catch {
      setLoading(false);
      return undefined;
    }
  }, []);

  return { user, session: user, loading, ready: !loading };
}
