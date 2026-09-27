import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/website")({
  head: () => ({ meta: [
    { title: "My Website — Influencers.com" },
    { name: "description", content: "Create, preview and manage your professional creator website." },
    { property: "og:title", content: "My Website — Influencers.com" },
    { property: "og:description", content: "Create, preview and manage your professional creator website." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CreatorWorkspace page="website" />,
});
