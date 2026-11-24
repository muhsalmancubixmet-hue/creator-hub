import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription & Plans — Influencers.com Creator Hub" },
      {
        name: "description",
        content: "Upgrade to Pro Creator for Google Gemini AI Pitch Studio, live smart chat replies and verified privileges.",
      },
      { property: "og:title", content: "Subscription & Plans — Influencers.com Creator Hub" },
      {
        property: "og:description",
        content: "Supercharge your creator sponsorships with Google Gemini AI.",
      },
    ],
  }),
  component: SubscriptionRoute,
});

function SubscriptionRoute() {
  return <CreatorWorkspace page="subscription" />;
}
