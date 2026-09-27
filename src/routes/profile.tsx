import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "My Profile — Influencers.com" },
    { name: "description", content: "Manage your public creator profile, biography, experience and collaborations." },
    { property: "og:title", content: "My Profile — Influencers.com" },
    { property: "og:description", content: "Manage your public creator profile, biography, experience and collaborations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CreatorWorkspace page="profile" />,
});
