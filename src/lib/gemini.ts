import { GoogleGenerativeAI } from "@google/generative-ai";
import seedData from "../data/seed_data.json";

let genAI: GoogleGenerativeAI | null = null;

const getApiKey = (): string => {
  const storedKey = localStorage.getItem("gemini_api_key");
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiKey = storedKey || (envKey !== "YOUR_API_KEY_HERE" ? envKey : null);

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add it in your Profile settings.");
  }
  return apiKey;
};

const getModelName = (): string => {
  return localStorage.getItem("gemini_model") || "gemini-3-flash-preview";
};

export const analyzeProblem = async (
  title: string,
  difficulty: string,
  url: string
): Promise<string> => {
  const apiKey = getApiKey();
  genAI = new GoogleGenerativeAI(apiKey);
  const modelName = getModelName();
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

const mentorSystemPrompt = `
You are an expert LeetCode and software engineering interview mentor. Your goal is to help users practice coding problems, explain concepts, and provide recommendations. 
Be encouraging, concise, and highly effective.

CRITICAL INSTRUCTION: You represent a specific platform that tracks coding problems for specific companies. 
If the user mentions a specific company, a list of actual problems for that company will be appended to their message as [SYSTEM CONTEXT]. 
ALWAYS prioritize recommending those exact problems from the context using the URLs provided.
You can cross-reference with your own knowledge, but the problems you recommend via the JSON cards MUST match the titles and links exactly as they would appear on LeetCode.

If the user asks for question recommendations (e.g. "Give me 5 Amazon hard string questions"), you MUST format your recommendations in a strict JSON array block using the code block format \`\`\`json_recommendations ... \`\`\`.

Example:
Here are some recommendations for you:
\`\`\`json_recommendations
[
  {
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "link": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "company": "Amazon"
  },
  {
    "title": "Minimum Window Substring",
    "difficulty": "Hard",
    "link": "https://leetcode.com/problems/minimum-window-substring/",
    "company": "Google"
  }
]
\`\`\`
Any regular Markdown text will be rendered as normal Chat, and the special JSON block will be rendered as beautiful Cards. Make sure difficulty is exactly "Easy", "Medium", or "Hard". Give realistic company names as strings.
`;

export const startMentorChatSession = (history: any[] = []) => {
  const apiKey = getApiKey();
  genAI = new GoogleGenerativeAI(apiKey);
  const modelName = getModelName();

  const availableCompanies = Object.keys(seedData).join(", ");

  const fullPrompt = `${mentorSystemPrompt}
  
  --- AVAILABLE DATA ---
  We have an internal database of problems for the following companies: ${availableCompanies}.
  `;

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: fullPrompt,
  });

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }]
    }))
  });

  return chat;
};

export const getRelevantContext = (userMessage: string): string => {
  const lowerMsg = userMessage.toLowerCase();
  const companies = Object.keys(seedData);
  const mentionedCompanies = companies.filter(c => lowerMsg.includes(c.toLowerCase()));

  if (mentionedCompanies.length === 0) return "";

  let relevantProblems: any[] = [];

  mentionedCompanies.forEach(company => {
    let problems = (seedData as any)[company].problems || [];

    // Quick filtering based on difficulty keywords
    const isHard = lowerMsg.includes("hard");
    const isMedium = lowerMsg.includes("medium");
    const isEasy = lowerMsg.includes("easy");

    if (isHard) {
      problems = problems.filter((p: any) => p.difficulty?.toLowerCase() === "hard");
    } else if (isMedium) {
      problems = problems.filter((p: any) => p.difficulty?.toLowerCase() === "medium");
    } else if (isEasy) {
      problems = problems.filter((p: any) => p.difficulty?.toLowerCase() === "easy");
    }

    // Quick topic filtering
    const commonTopics = ["array", "string", "hash table", "dynamic programming", "math", "sorting", "greedy", "depth-first search", "database", "binary search", "tree"];
    const mentionedTopics = commonTopics.filter(t => lowerMsg.includes(t));

    if (mentionedTopics.length > 0) {
      problems = problems.filter((p: any) => {
        if (!p.topics) return false;
        const pTopics = p.topics.map((t: any) => t.name.toLowerCase());
        return mentionedTopics.some(mt => pTopics.includes(mt));
      });
    }

    // Take top 15 to avoid overwhelming context
    problems.slice(0, 15).forEach((p: any) => {
      relevantProblems.push({
        title: p.title,
        difficulty: p.difficulty,
        url: p.url,
        company: company // Inject original case company name
      });
    });
  });

  if (relevantProblems.length === 0) return "";

  return `\n\n[SYSTEM CONTEXT - DO NOT SHOW TO USER: The user might be asking about problems for the mentioned companies. Here are some relevant local problems you CAN recommend: ${JSON.stringify(relevantProblems)}]`;
};
