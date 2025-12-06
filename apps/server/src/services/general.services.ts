import { GoogleGenAI } from "@google/genai";

export class AiServices {
  private ai;

  constructor(apiKey: string) {
    if (!process.env.GEMINI_API_KEY) {
      console.log("gemini api is missing");
      throw new Error("gemini api is missing");
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateStream(prompt: string) {
    const resStream = await this.ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: { role: "user", parts: [{ text: prompt }] },
    });

    return resStream;
  }
}
