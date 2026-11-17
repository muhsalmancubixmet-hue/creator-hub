import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Influencers.com" },
      {
        name: "description",
        content: "Curate campaign work, reels, videos and brand collaborations.",
      },
      { property: "og:title", content: "Portfolio — Influencers.com" },
      {
        property: "og:description",
        content: "Curate campaign work, reels, videos and brand collaborations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CreatorWorkspace page="portfolio" />,
});
