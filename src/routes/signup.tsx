import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/components/auth-pages";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Join as a Creator — Influencers.com" },
      { name: "description", content: "Access your Influencers.com creator workspace." },
      { property: "og:title", content: "Join as a Creator — Influencers.com" },
      { property: "og:description", content: "Access your Influencers.com creator workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});
