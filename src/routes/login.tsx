import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/auth-pages";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Sign In — Influencers.com" },
    { name: "description", content: "Access your Influencers.com creator workspace." },
    { property: "og:title", content: "Sign In — Influencers.com" },
    { property: "og:description", content: "Access your Influencers.com creator workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LoginPage,
});
