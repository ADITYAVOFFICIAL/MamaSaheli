// src/lib/geminif.ts

import {
    GoogleGenerativeAI,
    GenerationConfig,
    HarmCategory,
    HarmBlockThreshold,
} from '@google/generative-ai';

// --- Configuration ---
const API_KEY: string | undefined = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-flash-latest"; // Use a powerful and efficient model

// Initialize the Gemini client directly for this specialized service.
// This allows us to use a custom configuration tailored for this task.
const genAI: GoogleGenerativeAI | null = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// --- Generation Configuration for Formatting ---
// This config is optimized for a deterministic, structured JSON output.
const formattingGenerationConfig: GenerationConfig = {
    // A very low temperature makes the output more predictable and rule-based.
    temperature: 0.1,
    // This is the most critical setting. It forces the model to return a valid JSON object,
    // eliminating conversational filler and malformed responses.
    responseMimeType: "application/json",
    maxOutputTokens: 8192, // Sufficient for long blog posts
    topP: 0.9,
};

// --- Safety Settings ---
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- Type Definition for the Expected JSON Response ---
interface FormattingResponse {
    formattedMarkdown: string;
}

/**
 * Constructs a highly detailed and structured prompt for the Gemini API to format raw text into Markdown.
 * This prompt is engineered to maximize accuracy, contextual understanding of links/images,
 * and strict adherence to the required JSON output format.
 *
 * @param rawText - The unformatted text input by the user.
 * @returns The detailed prompt string.
 */
const createFormattingPrompt = (rawText: string): string => {
    return `
You are an expert-level text formatting tool. Your only function is to convert raw text into clean, semantically correct GitHub Flavored Markdown (GFM). You must follow all instructions precisely and output your response ONLY in the specified JSON format.

<INSTRUCTIONS>
1.  **Analyze Structure:** First, understand the semantic structure of the text (titles, lists, paragraphs, code blocks, etc.).
2.  **Apply GFM Rules Diligently:**
    *   **Headings:** Use Markdown headings (#, ##, ###) for titles and sections.
    *   **Paragraphs:** Ensure distinct paragraphs are separated by exactly one blank line.
    *   **Lists:** Format bulleted (-) and numbered (1.) lists correctly, including nested lists.
    *   **Emphasis:** Use bold (**text**) and italics (*text*) appropriately for emphasis.
    *   **Content Integrity:** You MUST NOT add, remove, or summarize content. Your job is to format, not edit. Correct only obvious, unambiguous typos.

3.  **Advanced Link & Image Handling:**
    *   **Image URLs:** If a URL clearly points to an image file (ends in .jpg, .jpeg, .png, .gif, .webp), convert it into a GFM image element: \`![Alt Text](URL)\`. Infer a descriptive \`Alt Text\` from the surrounding context. If no context is available, use a generic placeholder like 'User-provided image'.
    *   **Internal Profile Links:** If a URL is an internal application link starting with \`/profile/\`, convert it into a GFM link element: \`[Link Text](/profile/...)\`. Infer the \`Link Text\` from the context (e.g., 'my profile', 'John's profile'). If context is unclear, use 'View Profile'.
    *   **General URLs:** For all other standard URLs (starting with http:// or https://), convert them into GFM link elements: \`[Link Text](URL)\`. Use the surrounding text to create meaningful \`Link Text\`. If no context is available, you may use the URL itself as the link text.

4.  **CRITICAL OUTPUT REQUIREMENTS:**
    *   Your entire output MUST be a single, valid JSON object.
    *   The JSON object must match the structure defined in <JSON_STRUCTURE>.
    *   Do NOT output any text, explanation, or markdown code fences before or after the JSON object. Your response must start with \`{\` and end with \`}\`.
</INSTRUCTIONS>

<JSON_STRUCTURE>
{
  "formattedMarkdown": "string"
}
</JSON_STRUCTURE>

<EXAMPLE>
RAW TEXT:
A quick update
Hey everyone, check out my latest blog post at https://myblog.com/new-article. Also, here is a picture from my trip: https://images.unsplash.com/photo-123.jpeg. You can see more on my profile here: /profile/jane-doe-123

FORMATTED JSON OUTPUT:
{
  "formattedMarkdown": "# A quick update\\n\\nHey everyone, check out my [latest blog post](https://myblog.com/new-article). Also, here is a picture from my trip: ![Picture from my trip](https://images.unsplash.com/photo-123.jpeg). You can see more on [my profile here](/profile/jane-doe-123)."
}
</EXAMPLE>

<RAW_TEXT>
${rawText}
</RAW_TEXT>

Now, provide the formatted Markdown inside the "formattedMarkdown" key of the JSON object.
`;
};

/**
 * Sends raw text to the Gemini API and returns intelligently formatted Markdown,
 * now with the ability to convert image and profile URLs into proper Markdown elements.
 * This function is highly robust due to the use of Gemini's JSON mode.
 *
 * @param rawText - The plain text content to format.
 * @returns A Promise resolving to the formatted Markdown string.
 * @throws An error if the service is unavailable, the API call fails, or the response is invalid.
 */
export const formatContentWithGemini = async (rawText: string): Promise<string> => {
    // 1. Check Initialization and Input
    if (!genAI) {
        throw new Error("Gemini AI client is not initialized. Formatting is unavailable. Please check your API Key.");
    }
    const trimmedInput = rawText?.trim();
    if (!trimmedInput) {
        return ""; // Return empty string for empty input.
    }

    // 2. Prepare Prompt and Model
    const prompt = createFormattingPrompt(trimmedInput);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: formattingGenerationConfig,
        safetySettings: safetySettings,
    });
    const chat = model.startChat();

    // 3. Execute API Call and Handle Response
    try {
        console.log("Sending formatting request to Gemini with JSON mode...");
        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();

        // --- Validate and Parse JSON Response ---
        if (!responseText) {
            throw new Error("AI formatter returned an empty or null response.");
        }

        let parsedResponse: FormattingResponse;
        try {
            parsedResponse = JSON.parse(responseText);
        } catch (jsonError) {
            console.error("Failed to parse JSON response from Gemini:", responseText);
            throw new Error("AI returned a malformed JSON response. The content might be too complex or contain characters breaking the JSON structure. Please try again.");
        }

        // Check if the required key exists and is a string
        if (typeof parsedResponse.formattedMarkdown !== 'string') {
            console.error("Invalid JSON structure received:", parsedResponse);
            throw new Error("AI response is missing the required 'formattedMarkdown' field.");
        }

        const trimmedOutput = parsedResponse.formattedMarkdown.trim();

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

// --- Service Object Export ---
export const geminiFormattingService = {
    formatContentWithGemini,
};