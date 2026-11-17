import { createFileRoute } from "@tanstack/react-router";
import { CreatorWorkspace } from "@/components/creator-workspace";
import { CollabWorkspace } from "@/components/collab-workspace";

export const Route = createFileRoute("/collabs/$id")({
  head: () => ({
    meta: [
      { title: "Collaboration Workspace — Influencers.com" },
      { name: "description", content: "Track milestones, upload drafts and chat with the brand." },
      { property: "og:title", content: "Collaboration Workspace — Influencers.com" },
      {
        property: "og:description",
        content: "Track milestones, upload drafts and chat with the brand.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CollabRoute,
});

function CollabRoute() {
  const { id } = Route.useParams();
  return (
    <CreatorWorkspace page="collab">
      <CollabWorkspace id={id} />
    </CreatorWorkspace>
  );
}
