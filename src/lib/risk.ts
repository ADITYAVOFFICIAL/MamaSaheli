import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export interface RiskAnalysisResult {
  score: number; // 0 to 100
  level: "Low" | "Moderate" | "High" | "Critical";
  reasons: string[];
  recommendations: string[];
}

export const analyzePregnancyRisk = async (
  userData: any
): Promise<RiskAnalysisResult> => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  try {
    // Attempting to use the latest flash model, with a fallback
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite-preview", 
        generationConfig: { responseMimeType: "application/json" },
      });
    } catch (e) {
      // Fallback if 1.5 flash isn't supported on your API key yet
      model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    }

    const prompt = `
      You are an expert maternal health AI assistant. Analyze the following user data to determine a pregnancy risk score. 
      
      User Data:
      ${JSON.stringify(userData, null, 2)}

      Based on medical standards for maternal health, provide a risk assessment. 
      Calculate a risk score from 0 (lowest risk) to 100 (highest risk).
      Determine the risk level as strictly one of the following: "Low", "Moderate", "High", or "Critical".
      Provide an array of reasons (brief sentences) explaining why this score was given based on age, weight, blood pressure, existing medical conditions, or missing critical data.
      Provide an array of actionable recommendations for the user.

      Return the result EXACTLY as a JSON object with this structure:
      {
        "score": number,
        "level": "Low" | "Moderate" | "High" | "Critical",
        "reasons": ["reason 1", "reason 2"],
        "recommendations": ["rec 1", "rec 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Clean up potential markdown blocks if fallback model doesn't respect responseMimeType
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    const analysis: RiskAnalysisResult = JSON.parse(responseText);
    return analysis;
  } catch (error) {
    console.error("Error generating risk analysis from Gemini:", error);
    throw new Error("Failed to calculate risk score. Please try again later.");
  }
};