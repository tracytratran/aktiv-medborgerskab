import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key from environment variables
const getGeminiAI = () => {
  // Access the API key from environment variables
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  
  // For debugging - remove in production
  console.log("API Key available:", API_KEY ? "Yes" : "No");
  
  if (!API_KEY) {
    console.warn("Gemini API key is not set. AI explanations will not work.");
    throw new Error("Gemini API key is not configured");
  }
  
  return new GoogleGenerativeAI(API_KEY);
};

// For testing if the API key is configured
export const isGeminiConfigured = (): boolean => {
  console.log('process.env', process.env);
  return !!process.env.REACT_APP_GEMINI_API_KEY;
};

export const generateExplanation = async (question: string, correctAnswer: string, language: string): Promise<string> => {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a prompt that asks for an explanation of the question and answer
    const prompt = `
      I'm studying for a Danish citizenship test and I got this question wrong:
      
      Question: ${question}
      Correct answer: ${correctAnswer}
      
      Please explain this topic in simple terms. Focus on the historical, cultural, or political context 
      that makes this answer correct. Keep your explanation under 200 words and make it easy to understand.
      
      Respond in ${language} language.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating AI explanation:", error);
    return "Sorry, I couldn't generate an explanation at this time. Please try again later.";
  }
};
