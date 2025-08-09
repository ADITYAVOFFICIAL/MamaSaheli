// src/lib/geminiMod.ts

import {
    GoogleGenerativeAI,
    GenerationConfig,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
} from '@google/generative-ai';

// --- Import the central Gemini service ---
import geminiService, { AppChatMessage } from './gemini';

// --- Local Type Definitions (Unchanged) ---

/** Defines the possible moderation decisions. */
export enum ModerationDecision {
    ALLOW = "ALLOW",
    FLAG = "FLAG",
    DENY = "DENY",
    ERROR = "ERROR"
}

/** Defines the types of potential violations the AI can flag. */
export enum ModerationFlag {
    HATE_SPEECH = "HATE_SPEECH",
    HARASSMENT = "HARASSMENT",
    SPAM = "SPAM",
    PII = "PII",
    MEDICAL_MISINFORMATION = "MEDICAL_MISINFORMATION",
    EXPLICIT_CONTENT = "EXPLICIT_CONTENT",
    VIOLENCE_THREATS = "VIOLENCE_THREATS",
    SELF_HARM = "SELF_HARM",
    OFF_TOPIC = "OFF_TOPIC",
    UNCLEAR_PLACEHOLDER = "UNCLEAR_PLACEHOLDER",
    OTHER = "OTHER"
}

/** Structure for the moderation result returned by the service. */
export interface ModerationResult {
    decision: ModerationDecision;
    reason?: string;
    flags: ModerationFlag[];
    originalContent: string;
}

/** Options for the moderation request. */
export interface ModerationOptions {
    contentType?: 'forum_title' | 'forum_post' | 'general_text';
}

// --- Configuration for this specific task ---
const moderationGenConfig: GenerationConfig = {
    temperature: 0.1, // Low temperature for consistent, rule-based decisions
    maxOutputTokens: 512,
    topP: 0.9,
    // Use Gemini's built-in JSON mode for reliable structured output
    responseMimeType: "application/json",
};

// --- Helper Function: Create Moderation Prompt (Unchanged Logic) ---

/**
 * Constructs a detailed prompt for an AI to moderate content.
 * This function's logic is AI-provider agnostic and remains the same.
 */
const createModerationPrompt = (contentToModerate: string, options?: ModerationOptions): string => {
    const contentType = options?.contentType ?? 'general_text';
    const contextDescription = contentType.replace('_', ' ');

    const moderationRules = `
Moderation Guidelines for MamaSaheli Forum (Pregnancy & Parenting Focus):
1.  **NO Hate Speech/Harassment:** Prohibit targeted abuse, hate speech, or slurs in any language. Intent and targeting are key.
2.  **Handle Placeholder/Short Text:** Common placeholder words like "sample", "test", "asdf", or very short, neutral inputs should be "ALLOW". Do not misinterpret these as violations.
3.  **NO Spam/Excessive Promotion:** Deny unsolicited advertising or repetitive posts.
4.  **NO Personally Identifiable Information (PII):** Flag sharing of full names, specific addresses, phone numbers, etc.
5.  **NO Harmful Medical Misinformation:** Deny or Flag dangerous, unverified medical advice.
6.  **NO Explicit/Graphic Content:** Deny pornography or graphically violent content.
7.  **NO Threats/Incitement to Violence:** Deny clear threats of harm.
8.  **FLAG Sensitive Self-Harm Content:** Content explicitly detailing methods or expressing immediate suicidal intent requires urgent human review (FLAG decision).
9.  **FLAG Off-Topic Content:** Flag content clearly unrelated to the forum's focus.
`;

    const outputInstructions = `
**Analysis Task:**
Analyze the user-submitted text (${contextDescription}) against the Moderation Guidelines. Consider the context (forum for parents/expectant mothers).

**Output Format:**
Respond ONLY with a single, valid JSON object string. NO other text.
Keys: "decision", "reason", "flags".
- "decision": (string) "${ModerationDecision.ALLOW}", "${ModerationDecision.FLAG}", or "${ModerationDecision.DENY}".
- "reason": (string) Brief explanation (max 30 words) for FLAG/DENY. "No issues found." for ALLOW.
- "flags": (array of strings) Flags from [${Object.values(ModerationFlag).join(', ')}]. Empty array [] for ALLOW.

**Example (Placeholder Text - ALLOW):**
Input Text: "sample title sample content"
Output JSON:
{
  "decision": "ALLOW",
  "reason": "Placeholder text detected.",
  "flags": []
}

**CRITICAL:** Output ONLY the JSON object string.
`;

    return `
You are a content moderation assistant for the MamaSaheli forum. Analyze user text for compliance with guidelines.

${moderationRules}
${outputInstructions}

**Text Content to Analyze:**
---
${contentToModerate}
---

**Moderation Result (JSON only):**
`;
};

// --- Helper Function: Parse and Validate API Response (Unchanged Logic) ---
/**
 * Parses and validates the AI's JSON response string.
 * This function is provider-agnostic and remains the same.
 */
const parseAndValidateModerationResult = (responseText: string, originalContent: string): ModerationResult => {
    const defaultErrorResult: ModerationResult = {
        decision: ModerationDecision.ERROR,
        reason: "Failed to get a valid response from the moderation service.",
        flags: [],
        originalContent: originalContent,
    };

    if (!responseText?.trim()) {
        return { ...defaultErrorResult, reason: "Received empty response from AI." };
    }

    let cleanedJsonString = responseText.trim();
    // Safeguard against markdown code blocks around the JSON
    if (cleanedJsonString.startsWith("```json") && cleanedJsonString.endsWith("```")) {
        cleanedJsonString = cleanedJsonString.substring(7, cleanedJsonString.length - 3).trim();
    }

    let parsedData: unknown;
    try {
        parsedData = JSON.parse(cleanedJsonString);
    } catch (parseError: unknown) {
        return { ...defaultErrorResult, reason: `Invalid JSON format received from AI. ${parseError instanceof Error ? `Details: ${parseError.message}` : ''}` };
    }

    if (typeof parsedData !== 'object' || parsedData === null) {
        return { ...defaultErrorResult, reason: "AI response was not a valid JSON object." };
    }

    const result = parsedData as Partial<ModerationResult>;
    const decision = result.decision;

    if (!decision || !Object.values(ModerationDecision).includes(decision as ModerationDecision)) {
        return { ...defaultErrorResult, reason: `Invalid decision value received: ${decision}` };
    }

    const reason = typeof result.reason === 'string' ? result.reason.trim() : (decision === ModerationDecision.ALLOW ? "No issues found." : "No specific reason provided.");
    
    let flags: ModerationFlag[] = [];
    if (Array.isArray(result.flags)) {
        flags = result.flags.filter((flag: unknown): flag is ModerationFlag =>
            typeof flag === 'string' && Object.values(ModerationFlag).includes(flag as ModerationFlag)
        );
    }

    // Ensure consistency: ALLOW should not have flags.
    if (decision === ModerationDecision.ALLOW && flags.length > 0) {
        flags = [];
    }

    return {
        decision: decision as ModerationDecision,
        reason,
        flags,
        originalContent: originalContent,
    };
};


// --- Public API Function (Updated for Gemini) ---
export const moderateContent = async (
    contentToModerate: string,
    options?: ModerationOptions
): Promise<ModerationResult> => {
    if (!geminiService) {
        return { decision: ModerationDecision.ERROR, reason: "Moderation service not configured.", flags: [], originalContent: contentToModerate };
    }

    const trimmedContent = contentToModerate?.trim();
    if (!trimmedContent) {
        return { decision: ModerationDecision.ALLOW, reason: "Content is empty.", flags: [], originalContent: contentToModerate };
    }

    const prompt = createModerationPrompt(trimmedContent, options);
    const messages: AppChatMessage[] = [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Analyze the provided text and return the JSON moderation result.' }
    ];

    try {
        console.log("Sending moderation request to Gemini...");
        const responseText = await geminiService.sendMessage(
            messages
        );

        if (!responseText?.trim()) {
            console.warn("Gemini moderation returned an empty response. Defaulting to FLAG.");
            return {
                decision: ModerationDecision.FLAG,
                reason: "AI returned an empty response, flagging for manual review.",
                flags: [ModerationFlag.OTHER],
                originalContent: trimmedContent
            };
        }

        return parseAndValidateModerationResult(responseText, trimmedContent);

    } catch (error: unknown) {
        console.error('Error during Gemini moderation API call:', error);
        let reason = "An unexpected error occurred during content moderation.";
        if (error instanceof Error) {
            reason = `Moderation failed: ${error.message}`;
        }
        return { decision: ModerationDecision.ERROR, reason, flags: [], originalContent: trimmedContent };
    }
};

// --- Service Object Export (Renamed) ---
export const geminiModService = {
    moderateContent,
};