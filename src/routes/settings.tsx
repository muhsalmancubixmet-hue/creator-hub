import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Creator Settings — Influencers.com" },
      {
        name: "description",
        content: "Manage creator account preferences, privacy, security and visibility.",
      },
      { property: "og:title", content: "Creator Settings — Influencers.com" },
      {
        property: "og:description",
        content: "Manage creator account preferences, privacy, security and visibility.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CreatorWorkspace page="settings" />,
});
