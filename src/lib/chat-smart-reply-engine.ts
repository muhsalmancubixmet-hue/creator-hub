/**
 * In-House Chat Smart Reply & Intent Detection Engine
 * Zero external dependencies. Tailored for creator-brand collaborations.
 */

export interface SmartReplyOption {
  id: string;
  title: string;
  badge: string;
  text: string;
}

export type MessageIntent =
  | "TIMELINE"
  | "PRICING"
  | "REVISIONS"
  | "APPROVAL"
  | "ASSETS"
  | "GENERAL";

/**
 * Detects the core intent behind a brand's message.
 */
export function detectMessageIntent(message: string): MessageIntent {
  if (!message || typeof message !== "string") return "GENERAL";

  const lower = message.toLowerCase();

  // Timeline & Delivery queries
  if (
    /\b(date|when|upload|draft|deadline|deliver|delivery|ready|eta|timeline|schedule|next draft|turnaround|timing)\b/i.test(
      lower
    ) ||
    lower.includes("estimated date") ||
    lower.includes("when can you") ||
    lower.includes("upload date")
  ) {
    return "TIMELINE";
  }

  // Budget, rate, discount queries
  if (
    /\b(budget|rate|rates|price|pricing|cost|costs|reduce|discount|expensive|quote|commercials|package|fee|negotiate|lower)\b/i.test(
      lower
    )
  ) {
    return "PRICING";
  }

  // Revisions, edits, feedback
  if (
    /\b(revision|revisions|change|changes|feedback|reshoot|remove|voiceover|audio|music|edit|edits|cut|tweak|notes|adjust|adjustment)\b/i.test(
      lower
    )
  ) {
    return "REVISIONS";
  }

  // Approvals & praises
  if (
    /\b(loved|love it|approved|approval|looks great|awesome|good to go|proceed|perfect|well done|excellent)\b/i.test(
      lower
    )
  ) {
    return "APPROVAL";
  }

  // Assets, samples, shipments
  if (
    /\b(logo|brief|product|sample|ship|courier|tracking|assets|guidelines|brand assets|delivery address)\b/i.test(
      lower
    )
  ) {
    return "ASSETS";
  }

  return "GENERAL";
}

/**
 * Returns dynamic, context-aware smart replies tailored to the brand's latest query.
 */
export function getSmartReplies(
  lastBrandMessage: string | null | undefined,
  brandName: string,
  campaignName?: string,
  budget?: string
): SmartReplyOption[] {
  const brand = (brandName || "Brand").trim();
  const campaign = campaignName ? ` - ${campaignName}` : "";
  const intent = detectMessageIntent(lastBrandMessage || "");

  switch (intent) {
    case "TIMELINE":
      return [
        {
          id: "time-friday",
          title: "📅 Friday Upload",
          badge: "Timeline",
          text: `Hi ${brand} Team! Thank you for checking in. The initial edit is progressing well. I am currently polishing the color grade and sound mix, and will have the updated draft uploaded by this Friday afternoon for your review. Does that timeline work for you?`,
        },
        {
          id: "time-extension",
          title: "⏳ Request 2 Days",
          badge: "Extension",
          text: `Hi ${brand} Team! To make sure the video pacing, audio mix, and retention hooks meet the highest standards for ${brand}, could we schedule the updated draft delivery for Monday morning? Let me know if that works for your team.`,
        },
        {
          id: "time-tomorrow",
          title: "🚀 Ready Tomorrow",
          badge: "Express",
          text: `Hi ${brand} Team! I'm already wrapping up the final cuts and will have the next draft uploaded by tomorrow evening for your review and sign-off.`,
        },
      ];

    case "PRICING":
      return [
        {
          id: "price-propose",
          title: "💼 Package Rate",
          badge: "Rate",
          text: `Hi ${brand} Team! Thank you for reaching out. Based on the scope, production value, and 30-day digital amplification rights, my standard package rate is ${
            budget || "₹25,000"
          }. This includes high-retention scripting, 4K production, and dedicated story amplification.`,
        },
        {
          id: "price-negotiate",
          title: "🤝 Flexible Scope",
          badge: "Counter-offer",
          text: `Hi ${brand} Team! If your campaign budget is strictly capped, I'd be happy to adjust deliverables—for example, 1 high-impact reel + 1 supporting story—to align with your allocated budget. Would you like to explore this?`,
        },
      ];

    case "REVISIONS":
      return [
        {
          id: "rev-incorporate",
          title: "✅ Incorporating Edits",
          badge: "Revision",
          text: `Hi ${brand} Team! Thank you for the specific notes. I completely agree with this direction. I am implementing the changes right now and will share the revised cut shortly.`,
        },
        {
          id: "rev-clarify",
          title: "❓ Clarify Notes",
          badge: "Clarify",
          text: `Hi ${brand} Team! Got your feedback notes. Before I finalize the re-edit, could you clarify whether you'd prefer the voiceover pacing to be more energetic or conversational? Happy to tailor it.`,
        },
      ];

    case "APPROVAL":
      return [
        {
          id: "app-next-step",
          title: "🎉 Next Step / Live",
          badge: "Milestone",
          text: `Hi ${brand} Team! So glad to hear that you love the direction! Once you confirm the milestone sign-off, I will proceed with publishing on schedule and share the live analytics link.`,
        },
      ];

    case "ASSETS":
      return [
        {
          id: "asset-request",
          title: "📦 Request Assets",
          badge: "Assets",
          text: `Hi ${brand} Team! Looking forward to reviewing the brand assets. Could you share the high-res PNG logo and vector guidelines so we can integrate them seamlessly into the production?`,
        },
      ];

    case "GENERAL":
    default:
      return [
        {
          id: "gen-accept",
          title: "🤝 Accept Terms",
          badge: "Accept",
          text: `Hi ${brand} Team! Thank you for reaching out. I'm excited about ${
            campaign || "our collaboration"
          }. I accept the proposed scope and can have the first draft ready for your review within 5 business days. Let's make this collaboration a success!`,
        },
        {
          id: "gen-rate",
          title: "💼 Propose Rate",
          badge: "Rate",
          text: `Hi ${brand} Team! Thank you for considering me for ${
            campaign || "the campaign"
          }. Based on the deliverables and usage rights, my standard package rate is ${
            budget || "₹25,000"
          }. Would this work for your team?`,
        },
      ];
  }
}

/**
 * Takes rough thoughts or creator cues (e.g., "Friday ready", "Need 2 days more", "Logo file ayakkoo")
 * and polishes them into an ultra-professional, courteous brand message.
 */
export function polishQuickCue(
  cue: string,
  brandName: string,
  lastBrandMessage?: string
): string {
  const brand = (brandName || "Brand").trim();
  const text = (cue || "").trim();
  if (!text) return "";

  const lower = text.toLowerCase();

  // If cue mentions days, date, friday, etc.
  if (
    lower.includes("friday") ||
    lower.includes("tomorrow") ||
    lower.includes("monday") ||
    lower.includes("date") ||
    lower.includes("upload")
  ) {
    return `Hi ${brand} Team! Just wanted to update you on the timeline: I will have the updated draft uploaded by ${text}. Really appreciate your patience, and looking forward to your thoughts on the final cut!`;
  }

  // If cue mentions extension or more time
  if (
    lower.includes("delay") ||
    lower.includes("more time") ||
    lower.includes("2 days") ||
    lower.includes("extension") ||
    lower.includes("samayam")
  ) {
    return `Hi ${brand} Team! To ensure the retention hooks, color grading, and audio fidelity are polished to perfection, could we take a brief extension (${text})? Thank you so much for your understanding!`;
  }

  // If cue mentions assets or logo
  if (
    lower.includes("logo") ||
    lower.includes("asset") ||
    lower.includes("file") ||
    lower.includes("send")
  ) {
    return `Hi ${brand} Team! Quick note regarding production assets: could you please provide ${text} so we can maintain full brand consistency in the final export?`;
  }

  // General fallback: formal corporate polish
  return `Hi ${brand} Team! Quick update from my end regarding our campaign: ${text}. Please let me know if this aligns with your expectations, or if you need any further clarifications!`;
}
