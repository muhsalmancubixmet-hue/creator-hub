import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Services & Pricing — Influencers.com" },
    { name: "description", content: "Manage creator services, deliverables, pricing and availability." },
    { property: "og:title", content: "Services & Pricing — Influencers.com" },
    { property: "og:description", content: "Manage creator services, deliverables, pricing and availability." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CreatorWorkspace page="services" />,
});
