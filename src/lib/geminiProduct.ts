// src/lib/geminiProduct.ts

import {
    GoogleGenerativeAI,
    GenerationConfig,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
} from '@google/generative-ai';

// --- Appwrite Type Imports ---
import { UserProfile } from './appwrite'; // Corrected path

// --- Import the central Gemini service ---
import geminiService, { AppChatMessage } from './gemini';

// --- Local Type Definitions (Unchanged) ---

// Define valid product categories
export const VALID_PRODUCT_CATEGORIES = [
    "Comfort", "Nutrition", "Health & Wellness", "Baby Gear",
    "Clothing", "Self-Care", "Books & Education"
] as const;

export type ProductCategory = typeof VALID_PRODUCT_CATEGORIES[number];

export interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  category?: ProductCategory | string;
  searchKeywords?: string;
  reasoning?: string;
}

// --- Configuration for this specific task ---
const generationConfig: GenerationConfig = {
    temperature: 0.5,
    maxOutputTokens: 8192, // Gemini 1.5 has a larger context, can be generous
    topP: 0.9,
    // Use Gemini's built-in JSON mode for reliable structured output
    responseMimeType: "application/json",
};

// --- Helper Function: Create Prompts (Unchanged Logic) ---

const BASE_JSON_INSTRUCTIONS = `
**Output Format:**
Provide the response STRICTLY as a valid JSON array. Each object in the array must represent a product and have keys "id", "name", "description", "category", "searchKeywords", and optionally "reasoning".
- **id:** A unique string identifier (e.g., "prod-1").
- **name:** Product name (string).
- **description:** Brief explanation (1-2 sentences) why it's helpful (string).
- **category:** Assign ONE category from this list: ${VALID_PRODUCT_CATEGORIES.join(', ')} (string).
- **searchKeywords:** 2-3 relevant search keywords (string).
- **reasoning:** (Optional) Briefly explain (max 15 words) *why* this product is relevant based on the user context/prompt provided (string).

**CRITICAL OUTPUT REQUIREMENTS:**
- **Output ONLY the JSON array.**
- **NO introductory/concluding text like \`\`\`json ... \`\`\`**
- **Ensure valid JSON syntax.**
`;

/** Creates prompt for PERSONALIZED recommendations. */
const createPersonalizedPrompt = (profile: UserProfile, categoryFocus?: ProductCategory | string): string => {
    const weeks = profile.weeksPregnant ?? 'unknown';
    const diet = profile.dietaryPreferences?.join(', ') || 'none specified';
    let context = `User Profile Context:\n- Pregnancy Stage: Approximately ${weeks} weeks\n- Dietary Preferences: ${diet}\n`;
    if (profile.preExistingConditions) context += `- Pre-existing Conditions: ${profile.preExistingConditions}\n`;
    const focusInstruction = categoryFocus ? `\n**Focus exclusively on products within the '${categoryFocus}' category.**` : '';
    return `You are a helpful assistant specializing in pregnancy products. Based on the user context, suggest up to 25 relevant products. Include a brief 'reasoning' field explaining the relevance. ${focusInstruction}\n\n${context}\n\n${BASE_JSON_INSTRUCTIONS}`;
};

/** Creates prompt for GENERAL recommendations. */
const createGeneralPrompt = (categoryFocus?: ProductCategory | string): string => {
    const focusInstruction = categoryFocus ? `\n**Focus exclusively on products within the '${categoryFocus}' category.**` : '';
    return `You are a helpful assistant specializing in pregnancy products. Suggest up to 25 generally useful products for expectant mothers. ${focusInstruction}\n\n${BASE_JSON_INSTRUCTIONS}`;
};

/** Creates prompt based on USER'S specific query. */
const createPromptBasedPrompt = (userPrompt: string, categoryFocus?: ProductCategory | string): string => {
    const focusInstruction = categoryFocus ? `\n**Focus exclusively on products within the '${categoryFocus}' category related to the user's request.**` : '';
    return `You are a helpful assistant specializing in pregnancy products. The user is asking for suggestions related to: "${userPrompt}". Suggest up to 25 relevant products. Include a 'reasoning' field explaining how the suggestion addresses the query. ${focusInstruction}\n\n${BASE_JSON_INSTRUCTIONS}`;
};

// --- Helper Function: Parse and Validate JSON (Unchanged Logic) ---
/**
 * Parses the AI response string (which should be a JSON array) and validates the structure.
 */
const parseAndValidateRecommendations = (responseText: string, context: string): ProductRecommendation[] => {
    let cleanedJsonString = responseText.trim();
    // Gemini's JSON mode is cleaner, but this is a good safeguard.
    const jsonStartIndex = cleanedJsonString.indexOf('[');
    const jsonEndIndex = cleanedJsonString.lastIndexOf(']');
    if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
        throw new Error(`AI response for ${context} recommendations did not contain a recognizable JSON array.`);
    }
    cleanedJsonString = cleanedJsonString.substring(jsonStartIndex, jsonEndIndex + 1);

    try {
        const parsedData: unknown = JSON.parse(cleanedJsonString);
        if (!Array.isArray(parsedData)) {
            throw new Error(`AI response for ${context} recommendations was not in the expected JSON array format.`);
        }

        const validatedRecommendations: ProductRecommendation[] = parsedData
            .map((item: unknown, index: number): ProductRecommendation | null => {
                if (typeof item !== 'object' || item === null) return null;
                const record = item as Record<string, unknown>;
                if (typeof record.name !== 'string' || !record.name.trim() || typeof record.description !== 'string' || !record.description.trim()) {
                    return null;
                }
                const finalCategory = (typeof record.category === 'string' && record.category.trim()) ? record.category.trim() : undefined;
                return {
                    id: `${context}-${Date.now()}-${index}`,
                    name: record.name.trim(),
                    description: record.description.trim(),
                    category: finalCategory,
                    searchKeywords: (typeof record.searchKeywords === 'string' && record.searchKeywords.trim()) ? record.searchKeywords.trim() : undefined,
                    reasoning: (typeof record.reasoning === 'string' && record.reasoning.trim()) ? record.reasoning.trim() : undefined,
                };
            })
            .filter((item): item is ProductRecommendation => item !== null);

        if (validatedRecommendations.length === 0 && parsedData.length > 0) {
            throw new Error(`AI response items for ${context} recommendations lacked required fields.`);
        }
        return validatedRecommendations;

    } catch (parseError: unknown) {
        throw new Error(`Failed to parse AI recommendations (${context}). ${parseError instanceof Error ? `Error: ${parseError.message}` : 'Invalid format.'}`);
    }
};

// --- Private Helper: Core Fetch Logic (Updated for Gemini) ---
/**
 * Internal function to handle the actual API call to Gemini and parsing.
 */
const _fetchAndParseGeminiRecommendations = async (
    prompt: string,
    contextLabel: string
): Promise<ProductRecommendation[]> => {
     if (!geminiService) {
        throw new Error(`Product recommendation service (${contextLabel}) is not available. Check API Key.`);
    }
    // For Gemini, we use a system prompt and a user prompt to trigger the generation.
    const messages: AppChatMessage[] = [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Please generate the product recommendations in the specified JSON array format.' }
    ];

     try {
        console.log(`Sending ${contextLabel} recommendation request to Gemini...`);
        // Call the central geminiService, passing our specialized config with JSON mode
        const responseText = await geminiService.sendMessage(
            messages
        );

        if (!responseText?.trim()) {
            throw new Error(`AI returned empty content for ${contextLabel} recommendations.`);
        }
        
        return parseAndValidateRecommendations(responseText, contextLabel);

    } catch (error: unknown) {
        console.error(`Error during ${contextLabel} Gemini fetch/parse:`, error);
        if (error instanceof Error) {
            throw new Error(`Product recommendation service error (${contextLabel}): ${error.message}`);
        } else {
            throw new Error(`An unexpected error occurred while fetching ${contextLabel} product recommendations.`);
        }
    }
};

// --- Public API Functions (Updated to use Gemini helper) ---

/** Fetches PERSONALIZED product recommendations based on user profile. */
export const getPersonalizedRecommendations = async (
    profile: UserProfile,
    categoryFocus?: ProductCategory | string
): Promise<ProductRecommendation[]> => {
    if (!profile) {
        throw new Error("User profile is required for personalized recommendations.");
    }
    const prompt = createPersonalizedPrompt(profile, categoryFocus);
    return _fetchAndParseGeminiRecommendations(prompt, 'personalized');
};

/** Fetches GENERAL product recommendations (not profile-specific). */
export const getGeneralRecommendations = async (
    categoryFocus?: ProductCategory | string
): Promise<ProductRecommendation[]> => {
    const prompt = createGeneralPrompt(categoryFocus);
    return _fetchAndParseGeminiRecommendations(prompt, 'general');
};

/** Fetches product recommendations based on a specific USER PROMPT. */
export const getPromptBasedRecommendations = async (
    userPrompt: string,
    categoryFocus?: ProductCategory | string
): Promise<ProductRecommendation[]> => {
     if (!userPrompt?.trim()) {
        throw new Error("User prompt cannot be empty for recommendations.");
    }
    const prompt = createPromptBasedPrompt(userPrompt.trim(), categoryFocus);
    return _fetchAndParseGeminiRecommendations(prompt, 'prompt-based');
};

// --- Service Object Export (Renamed) ---
export const geminiProductService = {
    getPersonalizedRecommendations,
    getGeneralRecommendations,
    getPromptBasedRecommendations,
};