export interface BrandReview {
  id: string;
  creatorName: string;
  creatorNiche: string;
  rating: number;
  date: string;
  comment: string;
  campaignType: string;
}

export interface BrandReputation {
  brandName: string;
  rating: number;
  reviewCount: number;
  paymentPunctuality: string;
  firstDraftApprovalRate: number;
  escrowFunded: boolean;
  completedCampaigns: number;
  badge: string;
  location: string;
  reviews: BrandReview[];
}

const BRAND_DATA: Record<string, BrandReputation> = {
  "Kochi Cafe": {
    brandName: "Kochi Cafe",
    rating: 4.9,
    reviewCount: 22,
    paymentPunctuality: "100% On-Time (Avg 24 hours)",
    firstDraftApprovalRate: 98,
    escrowFunded: true,
    completedCampaigns: 26,
    badge: "Top F&B Partner",
    location: "Kochi, Kerala",
    reviews: [
      {
        id: "rev-1",
        creatorName: "Ananya",
        creatorNiche: "Food & Lifestyle",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Very smooth collaboration! Clear brief on the new cold brew menu launch. Payment was credited the morning after our Reel went live.",
        campaignType: "Instagram Reel + 2 Stories",
      },
      {
        id: "rev-2",
        creatorName: "Rahul M.",
        creatorNiche: "Culinary Explorer",
        rating: 4.9,
        date: "1 month ago",
        comment:
          "Great hospitality during shoot. No endless revision requests; they loved our first cut. Highly recommended for food creators.",
        campaignType: "YouTube Short + Reel",
      },
      {
        id: "rev-3",
        creatorName: "Divya K.",
        creatorNiche: "City Guide Kochi",
        rating: 5,
        date: "2 months ago",
        comment:
          "Prompt communication from the marketing manager. Escrow payment was released within hours.",
        campaignType: "Ambassador Visit",
      },
    ],
  },
  "Kalyan Silks": {
    brandName: "Kalyan Silks",
    rating: 4.9,
    reviewCount: 48,
    paymentPunctuality: "100% On-Time (Direct Payout)",
    firstDraftApprovalRate: 96,
    escrowFunded: true,
    completedCampaigns: 62,
    badge: "Verified Enterprise",
    location: "Thrissur / Statewide",
    reviews: [
      {
        id: "rev-4",
        creatorName: "Malavika S.",
        creatorNiche: "Traditional & Bridal Fashion",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "One of the best heritage brands to work with in Kerala. Outfits delivered on time and campaign guidelines were crystal clear.",
        campaignType: "Festival Collection Reel",
      },
      {
        id: "rev-5",
        creatorName: "Sneha P.",
        creatorNiche: "Ethnic Wear Stylist",
        rating: 4.8,
        date: "Last month",
        comment:
          "High professionalism and generous creative freedom for the saree styling transition.",
        campaignType: "Dedicated YouTube Lookbook",
      },
    ],
  },
  "cubixmet": {
    brandName: "cubixmet",
    rating: 5.0,
    reviewCount: 16,
    paymentPunctuality: "Instant Escrow Release",
    firstDraftApprovalRate: 100,
    escrowFunded: true,
    completedCampaigns: 18,
    badge: "Tech Growth Partner",
    location: "Kochi, Kerala",
    reviews: [
      {
        id: "rev-6",
        creatorName: "Arjun Tech",
        creatorNiche: "Consumer Tech & AI",
        rating: 5,
        date: "1 week ago",
        comment:
          "Professional tech team. They appreciate deep product reviews and provide test accounts with prompt technical support.",
        campaignType: "Software Walkthrough",
      },
    ],
  },
  "cublogs": {
    brandName: "cublogs",
    rating: 4.8,
    reviewCount: 12,
    paymentPunctuality: "100% On-Time",
    firstDraftApprovalRate: 95,
    escrowFunded: true,
    completedCampaigns: 14,
    badge: "Digital Media Partner",
    location: "Ernakulam, Kerala",
    reviews: [
      {
        id: "rev-7",
        creatorName: "Nivin V.",
        creatorNiche: "Digital Marketing & Creator Tips",
        rating: 4.8,
        date: "2 weeks ago",
        comment: "Great experience working with the team on article syndication and social amplification.",
        campaignType: "Sponsored Thread + Story",
      },
    ],
  },
};

// Runtime in-memory storage (clears cleanly on page reload, strictly zero localStorage)
const IN_MEMORY_BRAND_REPUTATIONS: Record<string, BrandReputation> = {};

/**
 * Returns verified brand reputation data or generates realistic trusted scores for dynamic brands.
 */
export function getBrandReputation(brandName: string): BrandReputation {
  const clean = (brandName || "").trim();
  if (IN_MEMORY_BRAND_REPUTATIONS[clean]) {
    return IN_MEMORY_BRAND_REPUTATIONS[clean];
  }

  if (BRAND_DATA[clean]) {
    IN_MEMORY_BRAND_REPUTATIONS[clean] = JSON.parse(JSON.stringify(BRAND_DATA[clean]));
    return IN_MEMORY_BRAND_REPUTATIONS[clean];
  }

  // Derive stable pseudo-metrics from name for consistency
  const hash = clean.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = Number((4.6 + (hash % 4) * 0.1).toFixed(1));
  const reviewCount = 8 + (hash % 20);
  const completed = reviewCount + (hash % 10);

  const generated: BrandReputation = {
    brandName: clean || "Partner Brand",
    rating,
    reviewCount,
    paymentPunctuality: "100% On-Time (Avg 1.8 Days)",
    firstDraftApprovalRate: 94 + (hash % 6),
    escrowFunded: true,
    completedCampaigns: completed,
    badge: "Verified Brand",
    location: "Kerala, India",
    reviews: [
      {
        id: `rev-gen-${hash}-1`,
        creatorName: "Kerala Creator Collab Partner",
        creatorNiche: "Content Creator",
        rating,
        date: "Recently",
        comment:
          "Prompt communication and smooth milestone approval. Escrow payment released as soon as the deliverable link went live.",
        campaignType: "Sponsored Campaign",
      },
    ],
  };

  IN_MEMORY_BRAND_REPUTATIONS[clean] = generated;
  return generated;
}

export interface NewBrandReviewInput {
  creatorName?: string;
  creatorNiche?: string;
  rating: number;
  comment: string;
  campaignType?: string;
  paymentSpeed?: string;
}

/**
 * Records a verified creator review in in-memory session state.
 * Resets cleanly on page refresh.
 */
export function submitBrandReview(
  brandName: string,
  input: NewBrandReviewInput
): BrandReputation {
  const clean = (brandName || "").trim();
  const current = getBrandReputation(clean);

  const newReview: BrandReview = {
    id: `rev-user-${Date.now()}`,
    creatorName: input.creatorName?.trim() || "You (Verified Creator)",
    creatorNiche: input.creatorNiche?.trim() || "Content Creator",
    rating: input.rating,
    date: "Just now",
    comment: input.comment.trim(),
    campaignType: input.campaignType || "Sponsored Campaign",
  };

  const updatedReviews = [newReview, ...current.reviews];
  const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
  const newAvgRating = Number((totalRating / updatedReviews.length).toFixed(1));

  const updatedRep: BrandReputation = {
    ...current,
    rating: newAvgRating,
    reviewCount: updatedReviews.length,
    completedCampaigns: current.completedCampaigns + 1,
    paymentPunctuality: input.paymentSpeed || current.paymentPunctuality,
    reviews: updatedReviews,
  };

  IN_MEMORY_BRAND_REPUTATIONS[clean] = updatedRep;
  return updatedRep;
}
