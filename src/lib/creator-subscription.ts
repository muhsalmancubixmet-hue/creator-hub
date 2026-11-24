import { useEffect, useState } from "react";

export type CreatorPlanTier = "FREE" | "PRO";

export interface CreatorPlanDetails {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  currency: string;
  isPopular?: boolean;
  features: string[];
}

export const CREATOR_PLANS: Record<CreatorPlanTier, CreatorPlanDetails> = {
  FREE: {
    id: "plan-free-creator",
    name: "Free Creator",
    tagline: "Essential showcase & manual messaging for emerging creators",
    priceMonthly: 0,
    currency: "INR",
    features: [
      "Creator portfolio showcase",
      "Standard rate card listings",
      "Direct brand inquiries",
      "5 Free Google Gemini AI trial credits",
      "Community discovery access",
    ],
  },
  PRO: {
    id: "plan-pro-creator",
    name: "Pro Creator",
    tagline: "Supercharged creator business with Gemini AI & elite privileges",
    priceMonthly: 999,
    currency: "INR",
    isPopular: true,
    features: [
      "✨ Unlimited Google Gemini AI Brand Pitch Studio",
      "💬 Instant Gemini Smart Chat Replies & Cue Polisher",
      "🛡️ Verified Creator Blue Badge on all opportunities",
      "🌐 Custom domain connection (e.g. yourname.com)",
      "📑 Branded PDF Media Kit with live analytics export",
      "🚀 Priority ranking in brand discovery search",
      "⚡ 100% Escrow payout milestone protection",
    ],
  },
};

// In-memory runtime state (resets cleanly on page refresh, zero localStorage contamination)
let currentTier: CreatorPlanTier = "FREE";
let remainingAiCredits: number = 5;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function getCreatorSubscription() {
  return {
    tier: currentTier,
    plan: CREATOR_PLANS[currentTier],
    isPro: currentTier === "PRO",
    aiCredits: remainingAiCredits,
  };
}

export function upgradeToPro(): void {
  currentTier = "PRO";
  notify();
}

export function downgradeToFree(): void {
  currentTier = "FREE";
  remainingAiCredits = 5;
  notify();
}

export function consumeAiCredit(): boolean {
  if (currentTier === "PRO") return true; // Unlimited for Pro!
  if (remainingAiCredits > 0) {
    remainingAiCredits -= 1;
    notify();
    return true;
  }
  return false;
}

export function useCreatorSubscription() {
  const [state, setState] = useState(getCreatorSubscription);

  useEffect(() => {
    const update = () => setState(getCreatorSubscription());
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    ...state,
    upgradeToPro,
    downgradeToFree,
    consumeAiCredit,
  };
}
