// src/lib/gemini.ts

import {
    GoogleGenerativeAI,
    GenerationConfig,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
    Content,
    Part,
    GenerateContentResult,
    GenerateContentStreamResult,
    EnhancedGenerateContentResponse,
} from '@google/generative-ai';
import { format, parseISO } from 'date-fns';

// --- *** IMPORT Appwrite types *** ---
import {
    UserProfile,
    BloodPressureReading,
    BloodSugarReading,
    WeightReading,
    Appointment
} from "./appwrite"; // Adjust path if needed

// --- Type Definitions Specific to Interaction (These remain the same) ---
export interface UserPreferences {
    feeling?: string;
    age?: number;
    weeksPregnant?: number;
    preExistingConditions?: string;
    specificConcerns?: string;
}
export interface AdditionalChatContext {
    latestBp: BloodPressureReading | null;
    latestSugar: BloodSugarReading | null;
    latestWeight: WeightReading | null;
    upcomingAppointments: (Appointment & { dateTime?: Date | null })[];
    previousConcerns: string[];
}

// --- Gemini Type Definitions ---
// This is the format our application uses for chat history.
type AppChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string | (string | { type: 'image_url'; image_url: { url: string } })[];
};

// This is the format Gemini's API expects for chat history.
type GeminiChatMessage = Content;
type GeminiImagePart = Part;

// --- Configuration ---
const API_KEY: string | undefined = import.meta.env.VITE_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash"; // A powerful and efficient multimodal model

if (!API_KEY) {
    console.error("CRITICAL: VITE_PUBLIC_GEMINI_API_KEY environment variable is not set. Gemini service will be unavailable.");
}

// --- Initialization ---
const genAI: GoogleGenerativeAI | null = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// --- Generation Configuration for Gemini ---
const generationConfig: GenerationConfig = {
    temperature: 0.7,
    maxOutputTokens: 4096,
    topP: 0.95,
};

// --- Safety Settings for Gemini ---
const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- Helper Functions (Date/Context Formatting - Unchanged) ---
const formatDateSafe = (dateString: string | undefined | null): string => {
    if (!dateString) return 'unknown date';
    try {
        const date = parseISO(dateString);
        if (isNaN(date.getTime())) return 'invalid date';
        return format(date, 'MMM d, yyyy');
    } catch (error) {
        return 'error formatting date';
    }
};

const formatReadingForContext = (reading: BloodPressureReading | BloodSugarReading | WeightReading | null, type: 'BP' | 'Sugar' | 'Weight'): string => {
    if (!reading) return `No recent ${type} reading available.`;
    const dateStr = formatDateSafe(reading?.recordedAt);
    let readingStr = '';
    if (type === 'BP' && reading && 'systolic' in reading && 'diastolic' in reading) {
        readingStr = `BP: ${reading.systolic ?? 'N/A'}/${reading.diastolic ?? 'N/A'} mmHg`;
    } else if (type === 'Sugar' && reading && 'level' in reading) {
        readingStr = `Blood Sugar: ${reading.level ?? 'N/A'} mg/dL (${reading.measurementType || 'unspecified'})`;
    } else if (type === 'Weight' && reading && 'weight' in reading) {
        readingStr = `Weight: ${reading.weight ?? 'N/A'} ${reading.unit || 'units'}`;
    } else {
        return `Recent ${type} reading data is incomplete or unavailable.`;
    }
    if (readingStr.includes('N/A')) {
       return `Recent ${type} reading data is incomplete. (Logged on ${dateStr})`;
    }
    return `${readingStr} (Logged on ${dateStr}. For context only, do not interpret medically.)`;
};

const formatAppointmentsForContext = (appointments: (Appointment & { dateTime?: Date | null })[]): string => {
    if (!appointments || appointments.length === 0) return 'No upcoming appointments logged.';
    return `Upcoming Appointments:\n${appointments.map(app => {
        const type = app.appointmentType?.replace(/_/g, ' ') || 'General appointment';
        const dateTimeFormatted = app.dateTime && !isNaN(app.dateTime.getTime())
            ? format(app.dateTime, 'MMM d, yyyy h:mm a')
            : `${formatDateSafe(app.date)}${app.time ? ` at ${app.time}` : ''}`;
        return `- ${type} on ${dateTimeFormatted}`;
    }).join('\n')}`;
};

const formatPreviousConcernsForContext = (concerns: string[]): string => {
    if (!concerns || concerns.length === 0) return 'No specific recent concerns noted in chat history.';
    return `Recent Topics/Concerns (Memory Aid):\n${concerns.slice(-3).map(c => `- "${c.substring(0, 100)}${c.length > 100 ? '...' : ''}"`).join('\n')}`;
};

// --- System Prompt Creation (Unchanged Logic) ---
export const createSystemPrompt = (
    userPrefs: UserPreferences,
    profileData: UserProfile | null,
    additionalContext: AdditionalChatContext
): string => {
    const name = profileData?.name || 'User';
    const age = userPrefs.age ?? profileData?.age;
    const weeks = userPrefs.weeksPregnant ?? profileData?.weeksPregnant;
    let contextString = "[User Context]\n";
    contextString += `- Name: ${name}\n`;
    if (age) contextString += `- Age: ${age}\n`;
    if (weeks !== undefined && weeks !== null) contextString += `- Weeks Pregnant: ${weeks}\n`;
    if (userPrefs.feeling) contextString += `- Current Feeling: ${userPrefs.feeling}\n`;
    const conditions = userPrefs.preExistingConditions ?? profileData?.preExistingConditions;
    if (conditions && conditions.toLowerCase() !== 'none') contextString += `- Pre-existing Conditions: ${conditions}\n`;
    if (userPrefs.specificConcerns) contextString += `- Specific Concerns Today: ${userPrefs.specificConcerns}\n`;
    contextString += "\n[Recent Health Readings (Context Only - DO NOT Interpret Medically)]\n";
    contextString += `${formatReadingForContext(additionalContext.latestBp, 'BP')}\n`;
    contextString += `${formatReadingForContext(additionalContext.latestSugar, 'Sugar')}\n`;
    contextString += `${formatReadingForContext(additionalContext.latestWeight, 'Weight')}\n`;
    contextString += "\n[Upcoming Schedule Context]\n";
    contextString += `${formatAppointmentsForContext(additionalContext.upcomingAppointments)}\n`;
    contextString += "\n[Recent Chat Context (Memory Aid)]\n";
    contextString += `${formatPreviousConcernsForContext(additionalContext.previousConcerns)}\n`;
    const personaInstructions = `[AI Persona & Role]
You are MamaSaheli. Your **sole function** when presented with an image by the user is to act as an **Optical Character Recognition (OCR) and Transcription assistant.** Your task is to **read and transcribe ALL visible text content** from the image accurately and completely. After transcription, you may offer simple explanations of terms *found in the transcription*, if helpful. Maintain a neutral, factual tone for transcription. You are explicitly NOT a medical professional.`;
    const safetyRules = `[CRITICAL RULES FOR TRANSCRIPTION]
**CORE TASK: Complete and Accurate Transcription of VISIBLE Text**
Your absolute priority is to **READ and TRANSCRIBE ALL text that is VISIBLE in the image the user provided.** The user has uploaded this image and expects a full transcription of its visible contents.
1.  **MANDATORY Full Transcription:** You **MUST** transcribe **ALL** readable text content. You are **STRICTLY FORBIDDEN** from omitting visible text or using placeholder phrases. If text is genuinely unreadable, state specifically what part is unreadable.
2.  **Explanation Limited to Transcribed Text:** If you provide explanations, they **MUST** be directly related to terms or phrases *present in your transcription*.
3.  **Final Mandatory Disclaimer (CRUCIAL):** **AFTER** providing the transcription, you **MUST ALWAYS** conclude with a clear disclaimer advising the user to consult their qualified healthcare provider.
4.  **EMERGENCY PROTOCOL:** If the user's message mentions severe symptoms, **STOP** transcription and immediately instruct them to seek URGENT medical attention.
5.  **Acknowledge Source:** Start your response by confirming you are processing the user's image.
6.  **User-Provided Data:** Remember, the user has explicitly provided this image for transcription. Your task is to fulfill that request accurately with the visible data.`;
    return `${personaInstructions}\n\n${contextString}\n\n${safetyRules}`;
};

// --- NEW: Function to convert a File object to Gemini API's image part format ---
export const fileToApiImagePart = async (file: File): Promise<GeminiImagePart> => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}. Please use JPG, PNG, WEBP, GIF, HEIC, or HEIF.`);
    }
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new Error(`Image file too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 20MB.`);
    }

    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64Data = dataUrl.split(',')[1];
            if (base64Data) {
                resolve(base64Data);
            } else {
                reject(new Error("Failed to extract Base64 data from Data URL."));
            }
        };
        reader.onerror = (error) => reject(error || new Error("FileReader error occurred."));
        reader.readAsDataURL(file);
    });

    try {
        const base64Data = await base64EncodedDataPromise;
        return {
            inlineData: {
                data: base64Data,
                mimeType: file.type,
            },
        };
    } catch (error: unknown) {
        throw new Error(`Failed to process image file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// --- Helper to convert App chat history to Gemini's format ---
const convertHistoryToGeminiFormat = (messages: AppChatMessage[]): GeminiChatMessage[] => {
    return messages
        .filter(msg => msg.role !== 'system')
        .map((msg): GeminiChatMessage => {
            const role = msg.role === 'assistant' ? 'model' : msg.role;
            let parts: Part[];

            if (Array.isArray(msg.content)) {
                parts = msg.content.map(part => {
                    if (typeof part === 'string') {
                        return { text: part } as Part;
                    }
                    const match = part.image_url.url.match(/data:(.*);base64,(.*)/);
                    if (!match) {
                        console.warn("Invalid data URI format for image, skipping.");
                        return { text: "[Unsupported Image Format]" } as Part;
                    }
                    return { inlineData: { mimeType: match[1], data: match[2] } } as Part;
                });
            } else {
                parts = [{ text: msg.content }];
            }
            return { role, parts };
        });
};

// --- Helper to convert app message content to Gemini message content ---
const appContentToGeminiContent = (content: AppChatMessage['content']): string | Part[] => {
    if (typeof content === 'string') {
        return content;
    }
    return content.map((part): Part => {
        if (typeof part === 'string') {
            return { text: part };
        }
        const match = part.image_url.url.match(/data:(.*);base64,(.*)/);
        if (!match) {
            throw new Error("Invalid data URI format for image in the last message.");
        }
        return { inlineData: { mimeType: match[1], data: match[2] } };
    });
};

// --- Core API Functions (Rewritten for Gemini) ---
export const startChat = (
    userPrefs: UserPreferences,
    profileData: UserProfile | null,
    additionalContext: AdditionalChatContext
): AppChatMessage[] => {
    if (!genAI) {
        throw new Error('Gemini service not initialized. Cannot start chat.');
    }
    try {
        const systemPromptText = createSystemPrompt(userPrefs, profileData, additionalContext);
        const systemMessage: AppChatMessage = { role: "system", content: systemPromptText };

        const name = profileData?.name || 'User';
        const feeling = userPrefs.feeling || 'reaching out';
        const weeksPregnant = userPrefs.weeksPregnant ?? profileData?.weeksPregnant;
        const weekMention = (weeksPregnant !== undefined && weeksPregnant !== null) ? ` at ${weeksPregnant} weeks pregnant` : '';
        const concernMention = userPrefs.specificConcerns ? ` I also wanted to mention I have some concerns about: ${userPrefs.specificConcerns}.` : '';
        const initialUserText = `Hi, I'm ${name}. I'm feeling ${feeling}${weekMention}.${concernMention} What should I know or do right now?`;
        const userMessage: AppChatMessage = { role: "user", content: initialUserText };

        const concernAck = concernMention ? ' and have noted your specific concerns' : '';
        const initialAssistantText = `Hello ${name}! Thanks for reaching out. I understand you're feeling ${feeling}${weekMention}${concernAck}. I've noted the context you provided. Remember, I'm here for general information and support, not medical advice. How can I assist you today?`;
        const assistantMessage: AppChatMessage = { role: "assistant", content: initialAssistantText };

        return [systemMessage, userMessage, assistantMessage];
    } catch (error: unknown) {
        if (error instanceof Error && (error.message.includes('API key') || error.message.includes('authentication'))) {
            throw new Error('Failed to start chat: Invalid or missing Gemini API Key.');
        }
        throw new Error('Failed to prepare initial chat messages due to an internal error.');
    }
};

export const sendMessage = async (messages: AppChatMessage[]): Promise<string> => {
    if (!genAI) throw new Error("Gemini service not available. Check API Key.");
    if (!messages?.length) return "[No message history provided]";

    const systemInstruction = messages.find(msg => msg.role === 'system')?.content as string || '';
    const history = messages.filter(msg => msg.role !== 'system');
    const lastMessage = history.pop();

    if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error("Last message must be from the user to generate a response.");
    }

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
        });

        const chat = model.startChat({
            history: convertHistoryToGeminiFormat(history),
            generationConfig,
            safetySettings,
        });

        const messageContent = appContentToGeminiContent(lastMessage.content);
        const result: GenerateContentResult = await chat.sendMessage(messageContent);
        const response: EnhancedGenerateContentResponse = result.response;
        const responseText = response.text();

        if (!responseText) {
             throw new Error(`AI provided no valid response content.`);
        }
        return responseText || "";

    } catch (error: unknown) {
         if (error instanceof Error) {
             throw new Error(`Failed to get non-streaming response: ${error.message}`);
         }
         throw new Error('Unknown error communicating with AI service.');
    }
};

export const sendMessageStream = async (
    messages: AppChatMessage[],
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
): Promise<void> => {
    if (!genAI) { onError(new Error("Gemini service not initialized. Check API Key.")); return; }
    if (!messages?.length) { onError(new Error("Cannot send empty message history for streaming.")); return; }

    const systemInstruction = messages.find(msg => msg.role === 'system')?.content as string || '';
    const history = messages.filter(msg => msg.role !== 'system');
    const lastMessage = history.pop();

    if (!lastMessage || lastMessage.role !== 'user') {
        onError(new Error("Last message must be from the user to generate a response."));
        return;
    }

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
        });

        const chat = model.startChat({
            history: convertHistoryToGeminiFormat(history),
            generationConfig,
            safetySettings,
        });

        const messageContent = appContentToGeminiContent(lastMessage.content);
        const result: GenerateContentStreamResult = await chat.sendMessageStream(messageContent);

        for await (const chunk of result.stream) {
            try {
                const chunkText = chunk.text();
                if (chunkText) {
                    onChunk(chunkText);
                }
            } catch (streamError) {
                console.error("Error processing stream chunk:", streamError);
            }
        }
        onComplete();

    } catch (error: unknown) {
         let userFriendlyError: Error;
         if (error instanceof Error) {
            if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
                userFriendlyError = new Error('Network error during streaming. Check connection.');
            } else if (error.message.includes('API key')) {
                 userFriendlyError = new Error('Authentication error during streaming. Check API key.');
            } else {
                userFriendlyError = new Error(`Streaming failed: ${error.message}`);
            }
         } else {
             userFriendlyError = new Error('Unknown error during AI stream.');
         }
         onError(userFriendlyError);
    }
};

// --- Service Object Export ---
const geminiService = {
    startChat,
    sendMessage,
    sendMessageStream,
    fileToApiImagePart,
    createSystemPrompt,
};

export default geminiService;

// --- Type Re-exports ---
export type {
    AppChatMessage,
    GeminiChatMessage,
    GeminiImagePart
};
