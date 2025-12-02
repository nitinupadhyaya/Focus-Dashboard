import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyzeActivity(title, url) {
  try {
    const prompt = `
You are a productivity assistant. Analyze this web activity and classify it as:
1️⃣ Productive
2️⃣ Neutral
3️⃣ Distracting
Give a short, friendly explanation.

Activity: "${title}"  
URL: ${url}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",  // Fast and free-tier friendly
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || "No response from model";
  } catch (err) {
    console.error("⚠️ Error analyzing activity:", err.message);
    return "⚠️ Unable to analyze (Groq not reachable).";
  }
}
