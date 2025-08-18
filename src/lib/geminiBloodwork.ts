import {
    GoogleGenerativeAI,
    GenerationConfig,
    HarmCategory,
    HarmBlockThreshold,
    Part,
} from '@google/generative-ai';

const API_KEY: string | undefined = import.meta.env.VITE_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash-latest";

const genAI: GoogleGenerativeAI | null = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const generationConfig: GenerationConfig = {
    temperature: 0.1,
    responseMimeType: "application/json",
    maxOutputTokens: 8192,
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export interface BloodworkResultItem {
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: 'Low' | 'Normal' | 'High' | 'N/A';
}

interface ParsedBloodworkResponse {
    results: BloodworkResultItem[];
    summary: string;
}

const createBloodworkExtractionPrompt = (): string => {
        return `
You are an expert AI medical data extraction tool. Your task is to analyze the provided image of a blood test report and extract key information into a structured JSON format. Focus on ALL bloodwork test names (biomarkers) present in the report, even if values are missing.

<INSTRUCTIONS>
1. **Identify All Biomarkers:** Scan the document for ALL test names (biomarkers) listed in the report, not just common ones. Include every test name you can read, even if no value is present.
2. **Extract Data:** For each identified biomarker, extract the following details if available:
    - name: The name of the test/biomarker.
    - value: The numerical or text result (if present, else empty string).
    - unit: The unit of measurement (if present, else empty string).
    - referenceRange: The normal range provided on the report (if present, else empty string).
    - flag: Calculate the flag as follows:
        - If both value and referenceRange are present and value is numeric, parse the reference range (e.g., "11.5 - 16.5") and compare:
            - "Low" if value < lower bound of reference range
            - "High" if value > upper bound of reference range
            - "Normal" if value is within reference range
        - If reference range uses alternate formats (e.g., "0 - 0", "01 - 06"), handle gracefully.
        - If value or referenceRange is missing, or value is not numeric, set flag to "N/A".
        - If the value is slightly outside the range (within 5% of the bounds), add a comment in the summary noting this.
3. **List All Test Names:** In addition to the extracted results, create an array called "allTestNames" containing every test/biomarker name you found in the report (even if not extracted in results).
4. **Generate Summary:** Create a brief, neutral, one-sentence summary of the report, mentioning any abnormal flags (e.g., "Hemoglobin is slightly low.").
5. **CRITICAL OUTPUT FORMAT:** Your entire response MUST be a single, valid JSON object matching the schema in <JSON_SCHEMA>. Do not include any text or explanations outside this JSON object.
</INSTRUCTIONS>

<JSON_SCHEMA>
{
    "type": "object",
    "properties": {
        "results": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": { "type": "string" },
                    "value": { "type": "string" },
                    "unit": { "type": "string" },
                    "referenceRange": { "type": "string" },
                    "flag": { "type": "string", "enum": ["Low", "Normal", "High", "N/A"] }
                },
                "required": ["name", "value", "unit", "referenceRange", "flag"]
            }
        },
        "allTestNames": {
            "type": "array",
            "items": { "type": "string" }
        },
        "summary": { "type": "string" }
    },
    "required": ["results", "allTestNames", "summary"]
}
</JSON_SCHEMA>

Analyze the provided image and return the structured JSON.
`;
};

export const extractBloodworkDataFromImage = async (file: File): Promise<ParsedBloodworkResponse> => {
    if (!genAI) {
        throw new Error("AI service is not initialized. Check API Key.");
    }

    const imagePart: Part = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];
            resolve({ inlineData: { mimeType: file.type, data: base64Data } });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig,
        safetySettings,
    });

    const prompt = createBloodworkExtractionPrompt();
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    if (!responseText) {
        throw new Error("AI did not return a response for the lab report.");
    }

    try {
        return JSON.parse(responseText) as ParsedBloodworkResponse;
    } catch (error) {
        console.error("Failed to parse AI JSON response:", responseText);
        throw new Error("AI returned a malformed response. The report might be difficult to read.");
    }
};