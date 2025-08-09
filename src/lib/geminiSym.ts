// src/lib/geminiSym.ts

import { UserProfile } from "./appwrite"; // Import UserProfile type

// --- Helper Function: Get Trimester Info (Unchanged) ---
/**
 * Calculates the trimester based on the week of pregnancy.
 * @param weeks - The number of weeks pregnant (can be number, string, undefined, or null).
 * @returns A string describing the trimester or stage.
 */
const getTrimesterInfo = (weeks: number | string | undefined | null): string => {
    const numWeeks = parseInt(String(weeks), 10);
    if (isNaN(numWeeks) || numWeeks < 1) {
        return "Pregnancy stage unknown";
    }
    if (numWeeks <= 13) return "First trimester";
    if (numWeeks <= 27) return "Second trimester";
    if (numWeeks <= 42) return "Third trimester";
    return "Post-term or invalid weeks";
};

// --- Helper: Format ALL profile details for context (Unchanged) ---
/**
 * Formats the UserProfile object into a readable string for the AI context.
 * @param profile - The user's profile data (nullable).
 * @returns A formatted multi-line string containing the relevant user profile context.
 */
const formatProfileContext = (profile: UserProfile | null): string => {
    if (!profile) {
        return "[User Profile Context]\n- Profile data not available.\n";
    }

    const formatOptional = (value: string | number | string[] | undefined | null, label: string): string => {
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
            return `${label}: N/A`;
        }
        return `${label}: ${Array.isArray(value) ? value.join(', ') : value}`;
    };

    let context = "[User Profile Context]\n";
    context += `- ${formatOptional(profile.name, 'Name')}\n`;
    context += `- ${formatOptional(profile.age, 'Age')}\n`;
    const weeks = profile.weeksPregnant;
    context += `- Weeks Pregnant: ${weeks !== undefined && weeks !== null && weeks >= 0 ? `${weeks} (${getTrimesterInfo(weeks)})` : 'N/A'}\n`;
    context += `- ${formatOptional(profile.preExistingConditions, 'Pre-existing Conditions')}\n`;
    context += `- ${formatOptional(profile.activityLevel, 'Activity Level')}\n`;
    // Add any other relevant fields as needed
    return context;
};

// --- Symptom Checker Prompt Function (Unchanged Logic) ---

/**
 * Creates the detailed system prompt for the Gemini API for the Symptom Checker feature.
 * This prompt instructs the AI on its specific role, critical safety rules,
 * how to use the provided context, and the required output format.
 *
 * @param symptoms - The symptoms description provided by the user.
 * @param profile - The user's profile data (nullable).
 * @returns The complete system prompt string ready to be sent to the Gemini API.
 */
export const createSymptomCheckerPrompt = (
    symptoms: string,
    profile: UserProfile | null
): string => {
    const profileContext = formatProfileContext(profile);
    const symptomsSection = `\n[User's Reported Symptoms/Concerns]\n"${symptoms.trim()}"\n`;

    const personaAndRules = `
[AI Persona & Role]
You are MamaSaheli, an informational assistant. Your role for this specific request is to provide **general information** about common pregnancy-related symptoms based ONLY on the user's description and their provided pregnancy stage context. You are **explicitly NOT a medical professional** and **CANNOT provide diagnosis, medical advice, or treatment recommendations.** Your primary goal is safety and directing the user to consult professionals.

[CRITICAL SAFETY RULES & OUTPUT FORMAT for Symptom Information Request]
1.  **Acknowledge Symptoms:** Start your response by briefly acknowledging the main symptoms the user described (e.g., "Regarding the headache and nausea you mentioned...").
2.  **Provide General Information ONLY:** Based *strictly* on the described symptoms and the provided pregnancy context, list **common, generally benign possibilities** or explanations for such symptoms *during that stage of pregnancy*. Focus on typical physiological changes.
    *   **DO NOT** list rare, complex, or serious conditions.
    *   **DO NOT** interpret the severity described by the user.
    *   **DO NOT** ask follow-up diagnostic questions.
    *   **DO NOT** suggest specific treatments or medications. You MAY suggest extremely generic and low-risk comfort measures (e.g., "Staying hydrated can sometimes help with general discomfort").
3.  **MANDATORY DISCLAIMER (Include VERBATIM at the END):** After providing any general information, you **MUST** conclude with the following disclaimer exactly as written:
    "---
    **Disclaimer:** This information is for general knowledge and informational purposes only, and does not constitute medical advice. It is essential to consult with a qualified healthcare provider (like your doctor) for any health concerns or before making any decisions related to your health or treatment. They can provide a proper diagnosis and advice tailored to your specific situation."
4.  **DO NOT DIAGNOSE:** Under absolutely no circumstances should you suggest a diagnosis. Do not use phrases like "you might have..." or "this sounds like...". Use objective statements like "Common causes for [symptom] during this stage *can* include...".
5.  **EMERGENCY PROTOCOL (Highest Priority):** If the user's *described symptoms* indicate a potential emergency (e.g., "heavy bleeding," "severe constant abdominal pain," "loss of consciousness," "can't feel baby move," "thoughts of harming myself or baby"), **STOP** generating general information. Your *entire* response should be ONLY the following instruction:
    "**Based on the symptoms you described, please seek urgent medical attention immediately. Contact your doctor, go to the nearest emergency room, or call your local emergency number (like 911 or 102) without delay.**"
    *Do not add the standard disclaimer if the Emergency Protocol is triggered.*
6.  **Output Format:** Present the information clearly using Markdown. The structure should be: Acknowledgement -> General Info (if applicable) -> Mandatory Disclaimer (unless Emergency Protocol triggered). Keep the response concise.
`;

    return `${personaAndRules}\n\n${profileContext}\n${symptomsSection}\n\n[AI Response - General Information & Disclaimer Only Following Rules Above]:`;
};

// --- Service Object Export (Renamed) ---
/**
 * Encapsulates the symptom-checker-specific Gemini logic for cleaner imports elsewhere.
 */
export const geminiSymptomService = {
    createSymptomCheckerPrompt,
    // NOTE: The actual API call is handled by the central `geminiService.sendMessage` function,
    // which is imported and used in the `SymptomCheckerPage.tsx` component.
    // This service only provides the specialized prompt generation logic.
};

export default geminiSymptomService;