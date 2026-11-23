import type { CreatorProfileData, WorkspaceOpportunityItem } from "@/lib/creator-profile-context";

export type PitchTone = "creative" | "roi" | "concise";

export interface CustomPitchParams {
  creatorName: string;
  creatorHandle?: string;
  creatorLocation?: string;
  creatorCategories?: string[];
  brandName: string;
  brandCategory?: string;
  platform?: string;
  tone?: PitchTone;
}

export interface GeneratedPitchSuite {
  dm: string;
  emailSubject: string;
  emailBody: string;
  rateQuote: string;
}

/**
 * Generates an instant high-converting pitch tailored to a specific brand opportunity.
 */
export function generateOpportunityPitch(
  creator: Partial<CreatorProfileData>,
  opportunity: WorkspaceOpportunityItem,
  tone: PitchTone = "creative",
): string {
  const name = creator.displayName || creator.name || "Creator";
  const brand = opportunity.business || "Team";
  const campaign = opportunity.name || "campaign";
  const category = opportunity.category || creator.categories?.[0] || "Lifestyle";
  const location = creator.location || "Kerala";
  const platform = opportunity.platform || "Instagram & YouTube";

  if (tone === "roi") {
    return (
      `Hi ${brand} Team, I’m ${name}, a ${category} creator based in ${location}. ` +
      `I’m excited about ${campaign} and have a strong track record of driving verified local engagement across ${platform}. ` +
      `My audience actively engages with authentic ${category} recommendations with consistent above-average views and high saves/shares. ` +
      `For ${campaign}, I propose delivering a high-retention video spotlight paired with story link-outs to maximize conversion. ` +
      `Looking forward to discussing creative angles and deliverables that match your campaign goals!`
    );
  }

  if (tone === "concise") {
    return (
      `Hey ${brand}! I’d love to collaborate on ${campaign}. ` +
      `I specialize in ${category} content for a community across ${platform} in ${location}. ` +
      `I can turn your brief into a vibrant, high-energy story with fast 5-day turnaround and full usage rights. ` +
      `Let’s make this collaboration a standout success!`
    );
  }

  // Creative default
  return (
    `Hi ${brand} Team! I'm ${name}, and I love what you’re building with ${campaign}. ` +
    `As a ${category} storyteller in ${location}, my creative focus is producing relatable, cinematic content that genuinely connects with audiences on ${platform}. ` +
    `Here is my concept: we weave ${campaign} seamlessly into a real-life day-in-the-life narrative with sharp pacing, clear brand value points, and a strong call-to-action. ` +
    `I’m ready to begin production as soon as the brief is locked. Let’s connect!`
  );
}

/**
 * Generates a full pitch suite (DM, Email, Rate Quote) for any target brand.
 */
export function generateCustomBrandPitch(params: CustomPitchParams): GeneratedPitchSuite {
  const creator = params.creatorName || "Creator";
  const brand = params.brandName.trim() || "Brand Team";
  const category = params.brandCategory || params.creatorCategories?.[0] || "Lifestyle & Culture";
  const platform = params.platform || "Instagram & YouTube";
  const location = params.creatorLocation || "Kerala, India";
  const handle = params.creatorHandle || "@creator";

  const dm =
    `Hey ${brand} team! 👋 I'm ${creator} (${handle}), a ${category} creator based in ${location}. ` +
    `I’ve been following your work and would love to partner together on a high-impact campaign across ${platform}. ` +
    `My audience loves genuine ${category} stories, with high engagement and strong local Kerala reach. ` +
    `Would you be open to a quick collaboration proposal this month? Excited to share ideas! 🚀`;

  const emailSubject = `Collaboration Proposal: ${creator} x ${brand} (${category})`;

  const emailBody =
    `Dear ${brand} Marketing Team,\n\n` +
    `My name is ${creator}, a ${category} content creator based in ${location} (${handle}). ` +
    `I have been closely following your brand and believe there is a natural fit for an authentic collaboration.\n\n` +
    `Why this collaboration works:\n` +
    `• Target Audience: Loyal, engaged followers interested in premium ${category} recommendations.\n` +
    `• High-Retention Storytelling: Crisp visual hooks, clear messaging, and measurable call-to-actions across ${platform}.\n` +
    `• Professional Delivery: Strict adherence to brand guidelines, 5 to 7 day turnaround, and transparent metrics reporting.\n\n` +
    `Proposed Deliverable Options:\n` +
    `1. Dedicated Video / Reel Spotlight with customized hook and brand integration.\n` +
    `2. Multi-Platform Storytelling Bundle (${platform}) for wider reach and sustained buzz.\n\n` +
    `I would love to send over my full media kit and tailor a package specifically for your upcoming goals.\n\n` +
    `Best regards,\n` +
    `${creator}\n` +
    `${location}`;

  const rateQuote =
    `Deliverables & Rate Proposal for ${brand}:\n` +
    `• 1x Dedicated High-Retention Video (${platform})\n` +
    `• 2x Supporting Stories with Direct Swipe-up / Sticker Link\n` +
    `• 30-Day Digital Usage & Organic Whitelisting Rights\n` +
    `• Estimated Turnaround: 5 business days\n` +
    `• Milestones secured via Influencers.com Escrow`;

  return { dm, emailSubject, emailBody, rateQuote };
}
