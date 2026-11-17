import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/opportunities")({
  validateSearch: (search: Record<string, unknown>): { apply?: string } => {
    const raw = search["apply"];
    return typeof raw === "string" && raw.length > 0 ? { apply: raw } : {};
  },
  head: () => ({
    meta: [
      { title: "Creator Opportunities — Influencers.com" },
      {
        name: "description",
        content: "Discover campaigns matched to your audience, location and creative work.",
      },
      { property: "og:title", content: "Creator Opportunities — Influencers.com" },
      {
        property: "og:description",
        content: "Discover campaigns matched to your audience, location and creative work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunitiesRoute,
});

function OpportunitiesRoute() {
  const search = Route.useSearch();
  return (
    <CreatorWorkspace
      page="opportunities"
      {...(search.apply ? { applyCampaignId: search.apply } : {})}
    />
  );
}
