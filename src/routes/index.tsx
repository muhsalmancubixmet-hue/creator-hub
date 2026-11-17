import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creator Dashboard — Influencers.com" },
      {
        name: "description",
        content:
          "Manage your creator profile, audience, opportunities and website from one workspace.",
      },
      { property: "og:title", content: "Creator Dashboard — Influencers.com" },
      {
        property: "og:description",
        content:
          "Manage your creator profile, audience, opportunities and website from one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CreatorWorkspace page="dashboard" />,
});
