// Prototype-only session flag. Replace with the shared backend's auth when it exists.
const KEY = "influencers.creator-session";
export const demoAuth = {
  isSignedIn: () => typeof window !== "undefined" && !!window.localStorage.getItem(KEY),
  signIn: (email: string) => window.localStorage.setItem(KEY, JSON.stringify({ email, creatorId: "cr_demo_001", at: Date.now() })),
  signOut: () => window.localStorage.removeItem(KEY),
};
