// Prototype & JWT session manager for creator workspace.
const KEY = "influencers.creator-session";

export const demoAuth = {
  isSignedIn: () => {
    if (typeof window === "undefined") return false;
    return !!window.localStorage.getItem(KEY) || !!window.localStorage.getItem("access_token");
  },
  getEmail: (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = window.localStorage.getItem(KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.email) return parsed.email;
      }
      return null;
    } catch {
      return null;
    }
  },
  isDemoUser: (): boolean => {
    if (typeof window === "undefined") return false;
    const email = demoAuth.getEmail();
    return email ? email.trim().toLowerCase() === "ananya@influencers.com" : false;
  },
  signIn: (email: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify({ email, at: Date.now() }));
  },
  signOut: () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("refresh_token");
  },
};
