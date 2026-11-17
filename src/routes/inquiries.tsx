import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/inquiries")({
  head: () => ({
    meta: [
      { title: "Collaboration Inquiries — Influencers.com" },
      { name: "description", content: "Review and respond to brand partnership inquiries." },
      { property: "og:title", content: "Collaboration Inquiries — Influencers.com" },
      { property: "og:description", content: "Review and respond to brand partnership inquiries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CreatorWorkspace page="inquiries" />,
});
