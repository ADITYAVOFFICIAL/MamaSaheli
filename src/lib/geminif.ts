// src/lib/geminif.ts

import {
    GoogleGenerativeAI,
    GenerationConfig,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
} from '@google/generative-ai';

// --- Import the central Gemini service ---
import geminiService, { AppChatMessage } from './gemini';

// --- Configuration ---
// The API key and model initialization are now handled centrally in `gemini.ts`

// --- Generation Configuration for this specific task ---
const formattingGenerationConfig: GenerationConfig = {
    // Lower temperature for more deterministic and consistent formatting results
    temperature: 0.15,
    maxOutputTokens: 8096, // Sufficient for long blog posts
    topP: 0.9,
};

// --- Prompt Creation Function (Unchanged Logic) ---

/**
 * Constructs a detailed prompt for an AI to format text into high-quality Markdown.
 * This function's logic is AI-provider agnostic and remains the same.
 */
const createFormattingPrompt = (rawText: string): string => {
    return `
You are a highly meticulous text formatting assistant specializing in GitHub Flavored Markdown (GFM).
Your sole task is to convert the provided raw text into clean, readable, well-structured, and semantically accurate Markdown but before understand the text and format accordingly.

Apply the following formatting rules diligently and intelligently:

1.  **Headings:** Use Markdown headings (#, ##, ###) for titles and sections. Infer logical heading levels.
2.  **Paragraphs:** Ensure distinct paragraphs are separated by exactly one blank line.
3.  **Lists:** Format bulleted (-) and numbered (1.) lists correctly, including nested lists with proper indentation.
4.  **Emphasis:** Use bold (**text**) for strong emphasis and italics (*text*) for mild emphasis.
5.  **Code:** Use backticks (\`) for inline code and fenced code blocks (\`\`\`) for multi-line code.
6.  **Blockquotes:** Use '>' for blockquotes.
7.  **Horizontal Rules:** Use '---' sparingly for thematic breaks.
8.  **Links & Images:** Preserve URLs or existing Markdown for links and images.
9.  **Tables:** Format tabular data as GFM tables if the structure is clear.
10. **Whitespace:** Remove unnecessary whitespace and ensure consistent indentation.
11. **Content Integrity:** Maintain the original meaning and all information precisely. Do NOT add, remove, or summarize content. Correct only obvious, unambiguous typos if essential.

**CRITICAL OUTPUT REQUIREMENTS:**
- **Output ONLY the formatted Markdown text.**
- **ABSOLUTELY NO introductory phrases** (like "Here is the formatted Markdown:").
- **ABSOLUTELY NO concluding remarks** or explanations.
- **Do NOT wrap the entire output in a Markdown code block.**

Raw Text to Format:
---
${rawText}
---

Formatted Markdown Output:
`;
};

// --- Public API Function (Updated for Gemini) ---

/**
 * Sends raw text to the Gemini API and returns intelligently formatted Markdown.
 *
 * @param rawText - The plain text content to format.
 * @returns A Promise resolving to the formatted Markdown string.
 * @throws An error if the Gemini service is unavailable, the API call fails, or the response is invalid.
 */
export const formatContentWithGemini = async (rawText: string): Promise<string> => {
    // 1. Check Initialization and Input
    if (!geminiService) {
        throw new Error("Gemini AI client is not initialized. Formatting unavailable. Check API Key.");
    }
    const trimmedInput = rawText?.trim();
    if (!trimmedInput) {
        return ""; // Return empty string for empty input, as before.
    }

    // 2. Prepare Prompt and API Request
    const prompt = createFormattingPrompt(trimmedInput);
    // For Gemini, we use a system prompt (via model config) and a user prompt.
    // Here, the detailed instructions are the main "user" prompt.
    const messages: AppChatMessage[] = [{ role: 'user', content: prompt }];

    // 3. Execute API Call and Handle Response
    try {
        console.log("Sending formatting request to Gemini...");

        // Use the sendMessage function from the central geminiService
        // We can override the default generation config for this specific task
        const formattedText = await geminiService.sendMessage(
            messages
        );
        
        console.log("Received formatting response from Gemini.");

        // --- Validate Formatted Content ---
        if (formattedText === null || formattedText === undefined) {
            throw new Error("AI formatter returned empty content unexpectedly.");
        }

        const trimmedOutput = formattedText.trim();
        // Return empty string if the result is only whitespace
        if (trimmedOutput.length === 0) {
            return "";
        }

        // --- Success ---
        console.log("Gemini formatting successful.");
        return trimmedOutput;

    // 4. Handle Errors during API Call
    } catch (error: unknown) {
        console.error('Error during Gemini formatting API call:', error);

        if (error instanceof Error) {
            // Re-throw specific errors to be caught by the UI
            throw new Error(`Gemini Formatting Failed: ${error.message}`);
        } else {
            // Catch-all for non-standard error types
            throw new Error('An unexpected error occurred during content formatting.');
        }
    }
};

// Optional: Export the service if needed elsewhere
export const geminiFormattingService = {
    formatContentWithGemini,
};