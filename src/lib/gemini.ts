import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export const analyzeProblem = async (
  title: string,
  difficulty: string,
  url: string
): Promise<string> => {
  // Try to get key from localStorage first, then env
  const storedKey = localStorage.getItem("gemini_api_key");
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiKey = storedKey || (envKey !== "YOUR_API_KEY_HERE" ? envKey : null);

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add it in your Profile settings.");
  }

  // Always re-init to ensure we have the latest key (in case user just updated it)
  genAI = new GoogleGenerativeAI(apiKey);

  // Get model from storage or default
  const modelName = localStorage.getItem("gemini_model") || "gemini-3-flash-preview";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    Analyze the LeetCode problem "${title}" (${difficulty}).
    URL: ${url}
    
    Provide a concise summary including:
    1. What the problem asks for.
    2. Key concepts/algorithms involved.
    3. Time and Space complexity requirements (or typical constraints).
    4. A brief hint or intuition without giving the full code solution immediately.
    
    Keep it under 200 words. Format with Markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing problem:", error);
    throw new Error("Failed to analyze problem. Please try again later.");
  }
};
