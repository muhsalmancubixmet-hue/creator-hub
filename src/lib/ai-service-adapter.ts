/**
 * Plug-and-Play AI Service Adapter
 * --------------------------------
 * Decouples all UI components (Inquiries Chat, AI Pitch Studio, Opportunity Apply Modal)
 * from the underlying AI transport.
 *
 * Current Mode: "client-gemini" (uses browser Gemini Flash + smart local fallback).
 * Backend Wiring Mode: Switch `AI_PROVIDER_MODE = "backend-proxy"` and point
 * `apiClient.post("/ai/chat-reply/")` to Django once backend endpoints are built.
 */

import {
  generateGeminiChatReply,
  generateGeminiBrandPitch,
  isGeminiConfigured,
  type ChatHistoryMessage,
} from "./gemini-ai";

export type AiProviderMode = "client-gemini" | "backend-proxy";

export const AI_PROVIDER_MODE: AiProviderMode = "client-gemini";

export interface PolishReplyRequest {
  brandName: string;
  campaignName?: string;
  lastBrandMessage: string;
  chatHistory?: ChatHistoryMessage[];
  creatorCue?: string;
}

export interface PolishReplyResponse {
  text: string;
  provider: "gemini" | "local-heuristic" | "backend-proxy";
}

export const aiServiceAdapter = {
  isLiveAiAvailable(): boolean {
    return AI_PROVIDER_MODE === "backend-proxy" || isGeminiConfigured();
  },

  async polishChatReply(req: PolishReplyRequest): Promise<PolishReplyResponse> {
    if (AI_PROVIDER_MODE === "backend-proxy") {
      // Backend plug-in point:
      // const res = await apiClient.post("/ai/chat-reply/", req);
      // return { text: res.data.text, provider: "backend-proxy" };
    }

    const res = await generateGeminiChatReply(req);
    return {
      text: res.text,
      provider: res.isGemini ? "gemini" : "local-heuristic",
    };
  },

  async generateBrandPitch(params: {
    brandName: string;
    industry: string;
    creatorNiche: string;
    creatorHandle: string;
    format: "DM" | "EMAIL" | "RATE_CARD";
    tone: "creative" | "roi" | "concise";
  }): Promise<string> {
    if (AI_PROVIDER_MODE === "backend-proxy") {
      // Backend plug-in point:
      // const res = await apiClient.post("/ai/brand-pitch/", params);
      // return res.data.text;
    }

    return generateGeminiBrandPitch(params);
  },
};
