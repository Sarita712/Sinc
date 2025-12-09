import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
// Note: In a real production app, you might proxy this through a backend to keep the key secret,
// but for this client-side demo, we use the env var directly as per instructions.
const ai = new GoogleGenerativeAI({ apiKey: process.env.API_KEY });

export const generateVibrationPattern = async (prompt: string): Promise<number[]> => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const response = await model.generateContent({
      contents: `Generate a vibration pattern array for the JavaScript navigator.vibrate() API based on this description: "${prompt}".
      The pattern should be an array of numbers representing milliseconds (vibrate, pause, vibrate, pause...).
      The total duration of the pattern should be approximately 10 seconds.
      Do not make intervals too short (min 50ms) or too long (max 1000ms).
      Return ONLY a JSON object with a "pattern" property containing the array of numbers.`,
    });

    const text = response.response.text();
    if (!text) return [1000, 200, 1000, 200, 1000]; // Fallback

    const data = JSON.parse(text);
    return data.pattern || [500];
  } catch (error) {
    console.error("Failed to generate vibration pattern:", error);
    // Return a default "error" buzz pattern (short rapid pulses)
    return [100, 100, 100, 100, 100, 100];
  }
};