import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [
    { title: "Creator Analytics — Influencers.com" },
    { name: "description", content: "Understand profile, website, portfolio and collaboration performance." },
    { property: "og:title", content: "Creator Analytics — Influencers.com" },
    { property: "og:description", content: "Understand profile, website, portfolio and collaboration performance." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CreatorWorkspace page="analytics" />,
});
