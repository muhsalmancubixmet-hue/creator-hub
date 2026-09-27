import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/media-kit")({
  head: () => ({ meta: [
    { title: "Media Kit — Influencers.com" },
    { name: "description", content: "Build and share a polished creator media kit for brand partnerships." },
    { property: "og:title", content: "Media Kit — Influencers.com" },
    { property: "og:description", content: "Build and share a polished creator media kit for brand partnerships." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CreatorWorkspace page="media-kit" />,
});
