import {
    GoogleGenerativeAI,
    GenerationConfig,
    HarmCategory,
    HarmBlockThreshold,
    Part,
} from '@google/generative-ai';

const API_KEY: string | undefined = import.meta.env.VITE_GEMINI_API_KEY;
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

export interface ParsedBloodworkResponse {
    results: BloodworkResultItem[];
    allTestNames: string[];
    summary: string;
}

const COMMON_BIOMARKERS_TO_EXTRACT = [
    'Hemoglobin', 'RBC Count', 'Hematocrit', 'MCV', 'MCH', 'MCHC', 'RDW-CV', 'RDW-SD', 
    'Platelet Count', 'MPV', 'WBC Count', 'Total Leucocyte Count', 'Neutrophils', 'Lymphocytes', 
    'Monocytes', 'Eosinophils', 'Basophils', 'TSH', 'Free T3', 'Free T4', 
    'Fasting Blood Sugar', 'Postprandial Blood Sugar', 'HbA1c', 'Glucose Challenge Test', 
    'Beta-hCG', 'Free Beta-hCG', 'PAPP-A', 'AFP', 'Unconjugated Estriol', 'Inhibin A',
    'Serum Ferritin', 'Serum Iron', 'TIBC', 'Transferrin Saturation'
];

const createBloodworkExtractionPrompt = (): string => {
    return `
You are an expert AI medical data extraction tool. Your task is to analyze the provided image of a blood test report and extract key information into a structured JSON format.

<CONTEXT>
- The report is for a user in India. Be aware of common Indian units like "lakhs/µL" for Platelet Count or "/mm³" or "/cumm" for WBC counts.
- Pay special attention to biomarkers relevant for pregnancy and general health. Prioritize finding values for the following common tests: ${COMMON_BIOMARKERS_TO_EXTRACT.join(', ')}.
</CONTEXT>

<INSTRUCTIONS>
1.  **Identify All Biomarkers:** Scan the entire document for every single test name (biomarker) listed. Do not skip any.
2.  **Extract Data for Each Biomarker:** For each identified biomarker, extract the following details:
    -   **name:** The clean, full name of the test/biomarker.
    -   **value:** The numerical or text result. If missing, use an empty string "".
    -   **unit:** The unit of measurement. If missing, use an empty string "".
    -   **referenceRange:** The normal range provided on the report. If missing, use an empty string "".
    -   **flag:** Calculate the flag based on the 'value' and 'referenceRange'.
        -   First, parse the 'value' into a number. If it's not a valid number, the flag is "N/A".
        -   Next, parse the 'referenceRange'. It can be in formats like "11.0 - 15.0", "< 92", "> 15", or "Up to 5.0".
        -   If the range is "X - Y", compare the value to X and Y.
        -   If the range is "< X" or "<= X", the value is "High" if it's >= X.
        -   If the range is "> X" or ">= X", the value is "Low" if it's <= X.
        -   Set the flag to "Low", "High", or "Normal". If a comparison is not possible, set it to "N/A".
3.  **Create 'allTestNames' List:** Create a separate array called "allTestNames" that contains every single test/biomarker name you found in the report, even if you couldn't extract full details for it.
4.  **Generate Summary:** Create a brief, neutral, one-sentence summary of the report. Mention any abnormal (Low or High) results concisely (e.g., "Hemoglobin is low and TSH is high."). If all values are normal, state that.
5.  **CRITICAL OUTPUT FORMAT:** Your entire response MUST be a single, valid JSON object that strictly adheres to the schema in <JSON_SCHEMA>. Do not include any text, markdown, or explanations outside of this JSON object.
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

Analyze the provided image and return only the structured JSON.
`;
};

export const extractBloodworkDataFromImage = async (file: File): Promise<ParsedBloodworkResponse> => {
    if (!genAI) {
        throw new Error("AI service is not initialized. Check API Key.");
    }

    const imagePart: Part = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error('Failed to read file as data URL.'));
            }
            const base64Data = reader.result.split(',')[1];
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
    
    try {
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        if (!responseText) {
            throw new Error("AI did not return a response for the lab report.");
        }

        return JSON.parse(responseText) as ParsedBloodworkResponse;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error during AI processing or JSON parsing:", error.message);
            if (error.message.includes("JSON")) {
                 throw new Error("AI returned a malformed response. The report might be difficult to read.");
            }
             throw new Error(`An AI processing error occurred: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI processing.");
    }
};