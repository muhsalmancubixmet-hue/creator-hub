/**
 * Contact Guard & Anti-Disintermediation Service Adapter
 * -----------------------------------------------------
 * Plug-and-Play Contract:
 *   - Pure detection logic runs synchronously on client before send.
 *   - `reportFlaggedAttempt()` writes to an in-memory session log in "mock" mode.
 *   - When Backend Phase starts, swap `ADAPTER_MODE` to "api" inside this file
 *     to persist alerts to `POST /api/v1/safety/chat-flags/` with zero UI changes.
 */

export type ContactViolationType =
  | "PHONE_NUMBER"
  | "EMAIL_ADDRESS"
  | "EXTERNAL_MESSENGER"
  | "UPI_PAYMENT"
  | "OBFUSCATED_CONTACT";

export interface ContactGuardResult {
  isBlocked: boolean;
  violations: ContactViolationType[];
  reason: string;
  matchedSnippet?: string;
}

export interface FlaggedChatAttempt {
  id: string;
  portal: "CREATOR_HUB" | "BUSINESS_SUITE";
  threadId: string;
  counterpartyName: string;
  violations: ContactViolationType[];
  maskedPreview: string;
  timestamp: string;
  status: "FLAGGED" | "DISMISSED" | "WARNED";
}

const ADAPTER_MODE: "mock" | "api" = "mock";

// In-memory store (resets cleanly on refresh, zero localStorage contamination)
const IN_MEMORY_FLAGS: FlaggedChatAttempt[] = [];

const DIGIT_WORDS_MAP: Record<string, string> = {
  zero: "0",
  oh: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

const EMOJI_DIGITS_MAP: Record<string, string> = {
  "0️⃣": "0",
  "1️⃣": "1",
  "2️⃣": "2",
  "3️⃣": "3",
  "4️⃣": "4",
  "5️⃣": "5",
  "6️⃣": "6",
  "7️⃣": "7",
  "8️⃣": "8",
  "9️⃣": "9",
};

function normalizeObfuscatedDigits(text: string): string {
  let normalized = text.toLowerCase();
  for (const [emoji, digit] of Object.entries(EMOJI_DIGITS_MAP)) {
    normalized = normalized.split(emoji).join(digit);
  }
  normalized = normalized.replace(
    /\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/gi,
    (w) => DIGIT_WORDS_MAP[w.toLowerCase()] ?? w,
  );
  return normalized;
}

/**
 * Inspects outgoing chat text for phone numbers, emails, UPI handles, or off-platform links.
 */
export function detectContactLeakage(rawText: string): ContactGuardResult {
  const text = (rawText || "").trim();
  if (!text) {
    return { isBlocked: false, violations: [], reason: "" };
  }

  const violations: ContactViolationType[] = [];
  let matchedSnippet: string | undefined;

  // 1. Direct or spaced/dashed phone numbers (7+ consecutive/grouped digits typical of mobile numbers)
  const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?){2,4}\d{3,5}/g;
  const phoneMatches = text.match(phoneRegex) || [];
  for (const m of phoneMatches) {
    const digitsOnly = m.replace(/\D/g, "");
    // Allow budgets like ₹25,000 or 2026 years; block 8+ digit phone-like strings
    const looksLikeCurrencyOrYear = /^[₹$€£]/.test(m.trim()) || (digitsOnly.length <= 7 && !m.includes("+"));
    if (!looksLikeCurrencyOrYear && digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      violations.push("PHONE_NUMBER");
      matchedSnippet = m.trim();
      break;
    }
  }

  // 2. Obfuscated spoken/emoji digits ("nine eight seven six five...")
  if (!violations.includes("PHONE_NUMBER")) {
    const normalized = normalizeObfuscatedDigits(text);
    const compressedDigits = normalized.replace(/[^0-9a-z]/gi, "");
    const digitRun = compressedDigits.match(/\d{8,}/);
    if (digitRun) {
      violations.push("OBFUSCATED_CONTACT");
      matchedSnippet = "Spelled-out / obfuscated phone digits";
    }
  }

  // 3. Email addresses (including "name at gmail dot com")
  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const obfuscatedEmailRegex = /\b[a-z0-9._%+-]+\s*(?:\(|\[)?at(?:\)|\])?\s*(gmail|yahoo|outlook|hotmail|icloud|proton)\s*(?:\(|\[)?dot(?:\)|\])?\s*[a-z]{2,}\b/i;
  const emailMatch = text.match(emailRegex) || text.match(obfuscatedEmailRegex);
  if (emailMatch) {
    violations.push("EMAIL_ADDRESS");
    matchedSnippet = matchedSnippet || emailMatch[0];
  }

  // 4. UPI / off-platform direct payment handles
  const upiRegex = /[a-z0-9._-]+@(?:okaxis|okicici|okhdfcbank|oksbi|ybl|ibl|axl|paytm|upi|apl)\b|\b(?:gpay|google\s*pay|phonepe|paytm\s*(?:me|number)|upi\s*id)\b/i;
  const upiMatch = text.match(upiRegex);
  if (upiMatch) {
    violations.push("UPI_PAYMENT");
    matchedSnippet = matchedSnippet || upiMatch[0];
  }

  // 5. External chat / off-platform solicitation links & phrases
  const messengerRegex = /(?:wa\.me\/|t\.me\/|chat\.whatsapp\.com|whatsapp\s*(?:me|no|num|number|\+|:)|telegram\s*(?:me|id|@)|call\s*(?:me|on|at)\s*(?:this|my)?\s*(?:no|num|number)?|dm\s*(?:me\s*)?(?:on|at)\s*(?:ig|insta|instagram))/i;
  const messengerMatch = text.match(messengerRegex);
  if (messengerMatch) {
    violations.push("EXTERNAL_MESSENGER");
    matchedSnippet = matchedSnippet || messengerMatch[0];
  }

  if (violations.length === 0) {
    return { isBlocked: false, violations: [], reason: "" };
  }

  const labelMap: Record<ContactViolationType, string> = {
    PHONE_NUMBER: "phone/mobile number",
    OBFUSCATED_CONTACT: "obfuscated phone number",
    EMAIL_ADDRESS: "email address",
    UPI_PAYMENT: "direct UPI/payment detail",
    EXTERNAL_MESSENGER: "external chat/WhatsApp link",
  };

  const primaryLabel = labelMap[violations[0]];
  return {
    isBlocked: true,
    violations,
    matchedSnippet,
    reason: `Sharing ${primaryLabel} in chat is blocked for Escrow protection. Keep communication inside Influencers.com until milestone lock.`,
  };
}

/**
 * Masks sensitive tokens before logging an attempted policy violation.
 */
export function maskSensitivePreview(text: string): string {
  return text
    .replace(/\d{4,}/g, "****")
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+/gi, "[redacted-handle]")
    .slice(0, 140);
}

/**
 * Plug-and-Play Service Adapter: Records flagged chat contact attempt.
 * Switches cleanly from in-memory mock to backend POST when ready.
 */
export async function reportFlaggedContactAttempt(params: {
  portal: "CREATOR_HUB" | "BUSINESS_SUITE";
  threadId: string;
  counterpartyName: string;
  rawText: string;
  violations: ContactViolationType[];
}): Promise<FlaggedChatAttempt> {
  const entry: FlaggedChatAttempt = {
    id: `flag-${Date.now()}`,
    portal: params.portal,
    threadId: params.threadId,
    counterpartyName: params.counterpartyName,
    violations: params.violations,
    maskedPreview: maskSensitivePreview(params.rawText),
    timestamp: new Date().toISOString(),
    status: "FLAGGED",
  };

  if (ADAPTER_MODE === "mock") {
    IN_MEMORY_FLAGS.unshift(entry);
    return entry;
  }

  // Future backend hook:
  // await apiClient.post("/safety/chat-flags/", entry);
  return entry;
}

export function getSessionFlaggedAttempts(): FlaggedChatAttempt[] {
  return [...IN_MEMORY_FLAGS];
}
