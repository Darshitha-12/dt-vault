
import { GoogleGenAI, Type } from "@google/genai";
import { SecurityAuditResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSecurityAudit = async (siteName: string, username: string): Promise<SecurityAuditResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a theoretical security audit for a login entry for "${siteName}" with username "${username}". 
      Assess common threats for this specific service and provide a risk score (1-100).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "A security score from 1-100" },
            vulnerabilities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of potential vulnerabilities for this service"
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Actionable security recommendations"
            }
          },
          required: ["score", "vulnerabilities", "recommendations"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as SecurityAuditResult;
  } catch (error) {
    console.error("Audit error:", error);
    return {
      score: 50,
      vulnerabilities: ["Audit connection failed"],
      recommendations: ["Check manual encryption settings"]
    };
  }
};

export const getGlobalSecurityBriefing = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give a short, 2-sentence 'cybersecurity threat brief' for today. Sound professional and high-tech.",
      config: {
        systemInstruction: "You are a lead security analyst for CypherVault. Your tone is urgent, technical, and precise."
      }
    });
    return response.text || "Global threat levels elevated. All systems green.";
  } catch (error) {
    return "Threat monitoring offline. Maintain active defense.";
  }
};
