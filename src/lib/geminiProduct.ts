// src/lib/geminiProduct.ts

import {
    GoogleGenerativeAI,
    GenerationConfig,
    HarmCategory,
    HarmBlockThreshold,
} from '@google/generative-ai';

// --- Appwrite Type Imports ---
import { UserProfile } from './appwrite';

// --- Local Type Definitions ---
export const VALID_PRODUCT_CATEGORIES = [
    "Comfort", "Nutrition", "Health & Wellness", "Baby Gear",
    "Clothing", "Self-Care", "Books & Education"
] as const;

export type ProductCategory = typeof VALID_PRODUCT_CATEGORIES[number];

export interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  category: ProductCategory | string; // Allow string as a fallback
  searchKeywords: string;
  reasoning?: string;
}

// --- Type for the expected top-level JSON response from the API ---
interface ProductResponse {
    recommendations: ProductRecommendation[];
}

// --- Configuration ---
const API_KEY: string | undefined = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash-latest";

// Initialize the Gemini client directly for this specialized service.
const genAI: GoogleGenerativeAI | null = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// This config is optimized for a creative but structured JSON output.
const generationConfig: GenerationConfig = {
    temperature: 0.6, // Allow for some creativity in suggestions
    // CRITICAL: This forces the model to return a valid JSON object.
    responseMimeType: "application/json",
    maxOutputTokens: 8192,
    topP: 0.9,
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Creates a single, highly detailed prompt for the Gemini API.
 * It dynamically builds the context based on available information (profile, user query, etc.).
 *
 * @param options - An object containing optional profile, userPrompt, and categoryFocus.
 * @returns The complete prompt string.
 */
const createProductPrompt = (options: {
    profile?: UserProfile | null;
    userPrompt?: string;
    categoryFocus?: ProductCategory | string;
}): string => {
    const { profile, userPrompt, categoryFocus } = options;
    let context = "<CONTEXT>\n";
    let hasContext = false;

    if (profile) {
        hasContext = true;
        context += "  <USER_PROFILE>\n";
        context += `    - Pregnancy Stage: Approximately ${profile.weeksPregnant ?? 'unknown'} weeks\n`;
        context += `    - Dietary Preferences: ${profile.dietaryPreferences?.join(', ') || 'none specified'}\n`;
        if (profile.preExistingConditions) {
            context += `    - Pre-existing Conditions: ${profile.preExistingConditions}\n`;
        }
        context += "  </USER_PROFILE>\n";
    }

    if (userPrompt) {
        hasContext = true;
        context += `  <USER_QUERY>"${userPrompt}"</USER_QUERY>\n`;
    }

    if (!hasContext) {
        context += "  <REQUEST_TYPE>General Recommendations</REQUEST_TYPE>\n";
    }
    context += "</CONTEXT>\n";

    const focusInstruction = categoryFocus
        ? `\n- **Category Focus:** You MUST suggest products exclusively from the '${categoryFocus}' category.`
        : '';

    return `
You are a specialized Product Recommendation Engine for "MamaSaheli," an app for expectant mothers. Your sole function is to generate relevant, safe, and helpful product suggestions based on the provided context and output them in a strict JSON format.

${context}
<INSTRUCTIONS>
- **Analyze Context:** Carefully review all information within the <CONTEXT> tags to understand the user's needs, pregnancy stage, and specific queries.
- **Generate Suggestions:** Create a list of up to 25 product recommendations that are highly relevant to the provided context.
- **Prioritize Safety:** All recommendations must be safe and appropriate for pregnancy. DO NOT suggest products that are generally advised against during pregnancy. DO NOT make any medical claims about the products.
- **Be Specific:** Provide concrete product ideas, not just general categories (e.g., "Maternity Pillow" is better than "Pillows").
- **Add Reasoning:** For personalized or query-based requests, the 'reasoning' field is mandatory and must briefly explain *why* the product is a good fit based on the context (e.g., "Addresses third-trimester back pain").
${focusInstruction}
- **CRITICAL OUTPUT FORMAT:** Your entire response MUST be a single, valid JSON object that strictly adheres to the schema defined in <JSON_SCHEMA>. Do not include any text, explanations, or markdown outside of this JSON object.
</INSTRUCTIONS>

<JSON_SCHEMA>
{
  "type": "object",
  "properties": {
    "recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "description": "A unique identifier you generate, e.g., 'prod-1'." },
          "name": { "type": "string", "description": "The specific product name." },
          "description": { "type": "string", "description": "A brief, helpful 1-2 sentence description." },
          "category": { "type": "string", "enum": ["${VALID_PRODUCT_CATEGORIES.join('", "')}"] },
          "searchKeywords": { "type": "string", "description": "A comma-separated string of 2-3 relevant search keywords." },
          "reasoning": { "type": "string", "description": "(Optional but required for personalized requests) A brief explanation of relevance." }
        },
        "required": ["id", "name", "description", "category", "searchKeywords"]
      }
    }
  },
  "required": ["recommendations"]
}
</JSON_SCHEMA>

Now, generate the JSON response based on the provided context.
`;
};

/**
 * Parses the AI's JSON response string and validates its structure.
 *
 * @param responseText - The raw text response from the AI.
 * @param contextLabel - A label for logging purposes (e.g., 'personalized').
 * @returns An array of validated ProductRecommendation objects.
 * @throws An error if parsing or validation fails.
 */
const parseAndValidateRecommendations = (responseText: string, contextLabel: string): ProductRecommendation[] => {
    try {
        const parsedData: unknown = JSON.parse(responseText);

        // Validate top-level structure
        if (typeof parsedData !== 'object' || parsedData === null || !('recommendations' in parsedData) || !Array.isArray((parsedData as ProductResponse).recommendations)) {
            throw new Error("AI response did not contain the required 'recommendations' array.");
        }

        const response = parsedData as ProductResponse;
        const validatedRecommendations: ProductRecommendation[] = [];

        for (const [index, item] of response.recommendations.entries()) {
            // Basic validation for required fields
            if (typeof item.name !== 'string' || !item.name.trim() ||
                typeof item.description !== 'string' || !item.description.trim() ||
                typeof item.category !== 'string' || !item.category.trim() ||
                typeof item.searchKeywords !== 'string' || !item.searchKeywords.trim()) {
                console.warn(`[${contextLabel}] Filtering out invalid item at index ${index} due to missing required fields:`, item);
                continue; // Skip this invalid item
            }

            // Ensure the category is one of the valid ones, but allow it as a fallback
            const finalCategory = VALID_PRODUCT_CATEGORIES.includes(item.category as ProductCategory)
                ? item.category
                : item.category;

            validatedRecommendations.push({
                id: `${contextLabel}-${Date.now()}-${index}`, // Generate a robust client-side ID
                name: item.name.trim(),
                description: item.description.trim(),
                category: finalCategory,
                searchKeywords: item.searchKeywords.trim(),
                reasoning: typeof item.reasoning === 'string' ? item.reasoning.trim() : undefined,
            });
        }

        if (validatedRecommendations.length === 0 && response.recommendations.length > 0) {
            throw new Error(`AI response items for ${contextLabel} recommendations lacked required fields or had invalid types.`);
        }

        console.log(`Successfully parsed ${validatedRecommendations.length} valid ${contextLabel} recommendations.`);
        return validatedRecommendations;

    } catch (parseError: unknown) {
        console.error(`Failed to parse ${contextLabel} Gemini JSON response:`, parseError);
        console.error(`Original ${contextLabel} response text received:`, responseText);
        throw new Error(`Failed to parse AI recommendations (${contextLabel}). ${parseError instanceof Error ? `Error: ${parseError.message}` : 'Invalid format received.'}`);
    }
};

/**
 * Internal function to handle the actual API call to Gemini and parsing.
 */
const _fetchAndParseGeminiRecommendations = async (prompt: string, contextLabel: string): Promise<ProductRecommendation[]> => {
    if (!genAI) {
        throw new Error(`Product recommendation service (${contextLabel}) is not available. Check API Key.`);
    }

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: generationConfig,
        safetySettings: safetySettings,
    });
    const chat = model.startChat();

    try {
        console.log(`Sending ${contextLabel} recommendation request to Gemini...`);
        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();

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

// --- Public API Functions ---

/** Fetches PERSONALIZED product recommendations based on user profile. */
export const getPersonalizedRecommendations = async (profile: UserProfile, categoryFocus?: ProductCategory | string): Promise<ProductRecommendation[]> => {
    if (!profile) {
        throw new Error("User profile is required for personalized recommendations.");
    }
    const prompt = createProductPrompt({ profile, categoryFocus });
    return _fetchAndParseGeminiRecommendations(prompt, 'personalized');
};

/** Fetches GENERAL product recommendations (not profile-specific). */
export const getGeneralRecommendations = async (categoryFocus?: ProductCategory | string): Promise<ProductRecommendation[]> => {
    const prompt = createProductPrompt({ categoryFocus });
    return _fetchAndParseGeminiRecommendations(prompt, 'general');
};

/** Fetches product recommendations based on a specific USER PROMPT. */
export const getPromptBasedRecommendations = async (userPrompt: string, categoryFocus?: ProductCategory | string): Promise<ProductRecommendation[]> => {
    if (!userPrompt?.trim()) {
        throw new Error("User prompt cannot be empty for recommendations.");
    }
    const prompt = createProductPrompt({ userPrompt: userPrompt.trim(), categoryFocus });
    return _fetchAndParseGeminiRecommendations(prompt, 'prompt-based');
};

// --- Service Object Export ---
export const geminiProductService = {
    getPersonalizedRecommendations,
    getGeneralRecommendations,
    getPromptBasedRecommendations,
};