import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generates a structured JSON response using Pebble (Gemini 2.5 Flash only)
 */
export async function generateAIResponse(prompt, pageContext = {}) {
    try {
        const systemPrompt = `
You are Pebble, an AI assistant embedded inside a Notion-like app called Pagelet.
Your role is to understand user intent and convert it into structured actions for the application to execute.

CONTEXT:
Page Title: ${pageContext.title || "Untitled"}
Total Blocks: ${pageContext.blocks?.length || 0}
Current Blocks JSON: ${JSON.stringify(
            pageContext.blocks?.map((b) => ({
                id: b._id,
                type: b.type,
                content: b.content,
                order: b.order,
            })) || []
        )}

INSTRUCTIONS:
1. Analyze the user's request based on the current page context.
2. Determine the intent (e.g., create_block, update_block, delete_block, answer_question).
3. Generate a JSON object with the following structure:
   {
     "intent": "string",
     "actions": [
       {
         "type": "insert_blocks", 
         "blocks": [{ "type": "paragraph", "content": { "text": "..." } }], 
         "afterBlockId": "optional_id"
       },
       { "type": "update_block", "id": "block_id", "updates": { ... } },
       { "type": "delete_block", "id": "block_id" },
       { "type": "create_page", "title": "New Page Title" }
     ],
     "response": "string"
   }

CRITICAL RULES:
- **Output must be VALID JSON only.** No markdown formatting code blocks.
- **The "response" field must NEVER be empty.**
- If "actions" are generated, the "response" MUST accurately confirm what was done (e.g., "I've added a to-do list for you.").
- If NO actions are generated, the "response" MUST answer the user's question or ask for clarification.
- Do not hallucinate IDs. Use the provided context.
- If the user asks a question about the page content, use the context to answer.
- **For links, MUST use block type "link" with content { "text": "link text", "url": "https://..." }. Do NOT use paragraph marks for links.**
`;

        const fullPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${prompt}`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: fullPrompt }],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });

        // ✅ SAFEST extraction (matches your working example)
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(text)
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch {
            // 🛟 fallback if Gemini wraps JSON
            const match = text.match(/\{[\s\S]*\}/);
            return match ? JSON.parse(match[0]) : null;
        }

    } catch (error) {
        console.error("Gemini AI error:", error.message);
        return null;
    }
}
