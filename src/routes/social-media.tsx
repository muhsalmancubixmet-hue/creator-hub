import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/social-media")({
  head: () => ({ meta: [
    { title: "Social Media — Influencers.com" },
    { name: "description", content: "Connect and review your creator social channels and audience metrics." },
    { property: "og:title", content: "Social Media — Influencers.com" },
    { property: "og:description", content: "Connect and review your creator social channels and audience metrics." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CreatorWorkspace page="social" />,
});
