/**
 * Google Gemini AI Integration for Influencers.com Creator Hub
 * Powered by Google Gemini 1.5 / 2.0 Flash.
 * Configured via VITE_GEMINI_API_KEY in .env
 */

import { polishQuickCue, getSmartReplies } from "./chat-smart-reply-engine";

export interface ChatHistoryMessage {
  sender: string;
  body: string;
  isMe?: boolean;
}

export function getGeminiApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return typeof key === "string" ? key.trim() : "";
}

export function isGeminiConfigured(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 5 && !key.includes("your-api-key"));
}

const SYSTEM_INSTRUCTION = `You are an elite AI Business Partner and Communication Assistant for top social media content creators on Influencers.com.
You help creators write natural, high-converting, courteous, and professional messages to brands, sponsors, agencies, and clients.
Rules:
1. Always sound like a confident, respectful, modern human creator (never sound robotic, generic, or like automated template spam).
2. Carefully read the brand's inquiry and address their questions directly (such as draft deadlines, revisions, rates, deliverables).
3. If the creator provides a rough thought, casual greeting, or note (e.g. "hey how are you", "friday ready", "need 2 more days"), smoothly merge it into the message so the flow feels organic, warm, and natural.
4. Keep messages concise and action-oriented (2-4 sentences max for chat, unless asked for an email proposal).
5. Output ONLY the response text to send. No quotes, no preamble ("Here is your response:"), no pleasantries to the creator.`;

/**
 * Generates an intelligent, context-aware reply using Google Gemini Flash.
 * Falls back gracefully to the local engine if no API key is configured.
 */
export async function generateGeminiChatReply(params: {
  brandName: string;
  campaignName?: string;
  lastBrandMessage: string;
  chatHistory?: ChatHistoryMessage[];
  creatorCue?: string;
}): Promise<{ text: string; isGemini: boolean }> {
  const apiKey = getGeminiApiKey();

  // If Gemini is not configured, use the enhanced local engine seamlessly
  if (!apiKey || !isGeminiConfigured()) {
    if (params.creatorCue?.trim()) {
      return {
        text: polishQuickCue(params.creatorCue, params.brandName, params.lastBrandMessage),
        isGemini: false,
      };
    }
    const fallbackOptions = getSmartReplies(
      params.lastBrandMessage,
      params.brandName,
      params.campaignName
    );
    return {
      text: fallbackOptions[0]?.text || `Hi ${params.brandName} Team! Thank you for following up.`,
      isGemini: false,
    };
  }

  // Construct structured prompt for Gemini Flash
  const recentHistory = (params.chatHistory || [])
    .slice(-4)
    .map((m) => `${m.isMe ? "Creator (You)" : `Brand (${params.brandName})`}: "${m.body}"`)
    .join("\n");

  const prompt = `${SYSTEM_INSTRUCTION}

CONTEXT:
Brand Name: ${params.brandName}
Campaign: ${params.campaignName || "Brand Collaboration"}
${recentHistory ? `Recent Conversation History:\n${recentHistory}\n` : ""}
Latest Message from Brand: "${params.lastBrandMessage || "No prior message"}"
${params.creatorCue ? `Creator's rough note / cue: "${params.creatorCue}"` : "The creator wants a thoughtful, professional response addressing the brand's latest query."}

TASK:
Write the exact message the creator should send back to ${params.brandName}. Address their latest message and blend in the creator's cue smoothly and courteously.`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350,
        },
      }),
    });

    if (!res.ok) {
      console.warn("Gemini API call failed with status", res.status);
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText && typeof candidateText === "string") {
      return {
        text: candidateText.trim().replace(/^["']|["']$/g, ""),
        isGemini: true,
      };
    }

    throw new Error("No text candidate returned from Gemini");
  } catch (err) {
    console.warn("Falling back to local smart engine:", err);
    return {
      text: polishQuickCue(params.creatorCue || "", params.brandName, params.lastBrandMessage),
      isGemini: false,
    };
  }
}

/**
 * Generates an ultra-personalized Brand Pitch using Google Gemini Flash.
 */
export async function generateGeminiBrandPitch(params: {
  brandName: string;
  industry: string;
  creatorNiche: string;
  creatorHandle: string;
  format: "DM" | "EMAIL" | "RATE_CARD";
  tone: "creative" | "roi" | "concise";
}): Promise<string> {
  const apiKey = getGeminiApiKey();

  if (!apiKey || !isGeminiConfigured()) {
    return ""; // Caller will use local fallback
  }

  const prompt = `${SYSTEM_INSTRUCTION}

TASK:
Generate a high-converting ${params.format} pitch for a content creator pitching to ${params.brandName} (${params.industry} brand).
Creator Niche: ${params.creatorNiche}
Creator Handle: ${params.creatorHandle}
Desired Tone: ${params.tone}
Format: ${params.format === "EMAIL" ? "Full email with Subject Line and email body" : params.format === "DM" ? "Engaging Instagram/WhatsApp/LinkedIn DM under 120 words" : "Deliverables package quote breakdown"}

Make it persuasive, credible, and tailored specifically to the ${params.industry} industry. Output ONLY the pitch.`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 450,
        },
      }),
    });

    if (!res.ok) throw new Error("Gemini pitch generation failed");
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (err) {
    console.warn("Gemini pitch generation failed:", err);
    return "";
  }
}
