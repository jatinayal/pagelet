import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { generateAIResponse } from "@/lib/gemini";

// 🔴 REQUIRED: Gemini SDK needs Node runtime
export const runtime = "nodejs";

/**
 * POST /api/ai/chat
 * Body: { message: string, pageContext?: object }
 */
async function chatHandler(request) {
    try {
        if (
            !process.env.GEMINI_API_KEY ||
            process.env.GEMINI_API_KEY === "PLACEHOLDER"
        ) {
            return NextResponse.json(
                { error: "Gemini API key is not configured" },
                { status: 503 }
            );
        }

        const { message, pageContext } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const pebbleResponse = await generateAIResponse(message, pageContext);

        // ✅ NEVER THROW FOR AI FAILURES
        if (!pebbleResponse) {
            return NextResponse.json({
                intent: "fallback",
                actions: [],
                response: "I couldn’t process that. Can you rephrase or try again?"
            });
        }

        return NextResponse.json({
            intent: pebbleResponse.intent,
            actions: pebbleResponse.actions,
            response: pebbleResponse.response
        });

    } catch (error) {
        console.error("AI Chat Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// ✅ Correct usage
export const POST = withAuth(chatHandler);
