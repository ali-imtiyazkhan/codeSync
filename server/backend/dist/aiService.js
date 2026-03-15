"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCode = analyzeCode;
const generative_ai_1 = require("@google/generative-ai");
async function analyzeCode(code, fileName) {
    const API_KEY = process.env.GOOGLE_AI_API_KEY || "";
    if (!API_KEY) {
        console.warn("[AIService] No GOOGLE_AI_API_KEY found in process.env.");
        return [
            {
                type: "info",
                line: 1,
                message: "AI Analysis is in mock mode. Add GOOGLE_AI_API_KEY to your .env file.",
                suggestion: "If you just added it, try restarting the server."
            }
        ];
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
    try {
        // Using the full path 'models/' as sometimes required by specific API versions or SDKs
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });
        const prompt = `
      You are an expert code auditor. Analyze the following code from file "${fileName}" and identify potential issues like bugs, security risks, or performance bottlenecks.
      
      Respond ONLY with a valid JSON array of objects. Each object must have:
      - "type": one of "critical", "warning", or "info"
      - "line": the 1-indexed line number where the issue is
      - "message": a concise description of the issue
      - "suggestion": how to fix it
      
      If no issues are found, return an empty array [].
      
      CODE TO ANALYZE:
      \`\`\`
      ${code}
      \`\`\`
    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up markdown if necessary
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    }
    catch (error) {
        console.error("[AIService] Error during AI analysis:", error);
        return [{
                type: "critical",
                line: 0,
                message: "AI Analysis failed to generate a response.",
                suggestion: "Check your API quota or network connection."
            }];
    }
}
