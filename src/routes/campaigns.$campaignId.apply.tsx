import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/campaigns/$campaignId/apply")({
  head: () => ({
    meta: [
      { title: "Apply to Campaign — Influencers.com" },
      { name: "description", content: "Submit your collaboration proposal and pitch directly to the brand." },
      { property: "og:title", content: "Apply to Campaign — Influencers.com" },
      { property: "og:description", content: "Submit your collaboration proposal and pitch directly to the brand." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CampaignApplyRoute,
});

function CampaignApplyRoute() {
  const { campaignId } = Route.useParams();
  return <CreatorWorkspace page="opportunities" applyCampaignId={campaignId} />;
}

