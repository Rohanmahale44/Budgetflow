import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

// Initialize the client
// Note: The API Key is expected to be in the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async analyzeFinances(transactions: Transaction[]): Promise<string> {
    try {
      // Limit to last 50 transactions to fit context window comfortably and reduce token usage
      const recentTx = transactions.slice(0, 50).map(t => ({
        date: t.date,
        amount: t.amount,
        type: t.type,
        category: t.categoryName,
        note: t.note,
        paymentMethod: t.paymentMethod // Included to track cash usage
      }));

      const prompt = `
        Analyze the following list of financial transactions and provide 3 specific, brief, and actionable insights or trends. 
        Focus on spending habits, saving opportunities, and check specifically for any high cash spending patterns.
        Keep the tone encouraging and professional.
        Format the response as a simple markdown list.
        
        Transactions:
        ${JSON.stringify(recentTx, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Could not generate insights at this time.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "AI Insights are currently unavailable. Please check your API configuration.";
    }
  }
};