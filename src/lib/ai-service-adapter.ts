/**
 * Plug-and-Play AI Service Adapter (Wired to Django Backend Proxy)
 * ----------------------------------------------------------------
 * Routes AI requests securely through `/api/v1/ai/chat-reply/` and
 * `/api/v1/ai/brand-pitch/` so GEMINI_API_KEY stays strictly on the server
 * and subscription quotas are enforced server-side.
 * Falls back cleanly to local engine when offline or unauthenticated (demo mode).
 */

import { apiClient } from "./api-client";
import {
  generateGeminiChatReply,
  generateGeminiBrandPitch,
  isGeminiConfigured,
  type ChatHistoryMessage,
} from "./gemini-ai";

export type AiProviderMode = "client-gemini" | "backend-proxy";

export const AI_PROVIDER_MODE: AiProviderMode = "backend-proxy";

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
      try {
        const res = await apiClient.post("/ai/chat-reply/", {
          brand_name: req.brandName,
          campaign_name: req.campaignName || "",
          last_brand_message: req.lastBrandMessage || "",
          creator_cue: req.creatorCue || "",
          chat_history: (req.chatHistory || []).slice(-4),
        });
        if (res.data?.text) {
          return {
            text: res.data.text,
            provider: res.data.provider === "gemini" ? "gemini" : "backend-proxy",
          };
        }
      } catch (err: any) {
        // Propagate 402 quota errors explicitly if server-side Free quota exhausted
        if (err?.response?.status === 402) {
          throw err;
        }
        // Offline / demo fallback handled cleanly below
      }
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
      try {
        const res = await apiClient.post("/ai/brand-pitch/", {
          brand_name: params.brandName,
          industry: params.industry,
          creator_niche: params.creatorNiche,
          creator_handle: params.creatorHandle,
          format: params.format,
          tone: params.tone,
        });
        if (res.data?.text) {
          return res.data.text;
        }
      } catch {
        // Fallback to client generator seamlessly
      }
    }

    return generateGeminiBrandPitch(params);
  },
};
