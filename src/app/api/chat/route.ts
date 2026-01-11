import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// We force the route to be dynamic because it uses runtime processing
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { message, context, apiKey } = await req.json();

        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key is missing. Please configure it in settings." },
                { status: 400 }
            );
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        // Construct the prompt with retrieved context
        const systemPrompt = `
You are an expert Social Insurance and Labor Insurance Consultant (社会保険労務士).
Your goal is to answer the user's inquiry accurately, referencing the provided "Official Context" (Laws, Circulars, MHLW materials).

## Instructions:
1. **Tone**: Professional, polite, authoritative yet accessible. Japanese language only.
2. **Context Usage**: 
   - You MUST read the provided Reference Context below.
   - If the answer is in the context, cite it clearly (e.g., "雇用保険法第X条によれば...").
   - If the context doesn't fully cover it, rely on your general professional knowledge but state that it is a general view.
3. **Structure**:
   - **Conclusion**: Brief, direct answer.
   - **Explanation**: Detailed logic based on laws/circulars.
   - **Action**: What the user should do next (e.g., submit a form to Hello Work).
4. **Safety**: Do not provide tax or legal advice outside your scope.
`;

        // Flatten context for the prompt
        const contextString = context
            .map((c: any) => `[Source: ${c.source}] ${c.title}\n${c.snippet}`)
            .join("\n\n");

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // or fall back to gpt-3.5-turbo if 4o unavailable, but let's assume standard key
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Question: ${message}\n\nReference Context:\n${contextString}`
                },
            ],
            temperature: 0.3, // Low temperature for factual accuracy
        });

        const aiText = response.choices[0].message.content;

        return NextResponse.json({ text: aiText });
    } catch (error: any) {
        console.error("OpenAI API Error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong with the AI generation." },
            { status: 500 }
        );
    }
}
