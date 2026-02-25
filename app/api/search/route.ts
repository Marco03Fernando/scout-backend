import { NextResponse } from "next/server";
import OpenAI from "openai";
import { inventory } from "@/lib/inventory";
import { aiResponseSchema } from "@/lib/schema";

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Make sure this API key is set in `.env.local`
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ matches: [] });
    }

    const system = `
You are a travel matching assistant.

STRICT RULES:
- You may ONLY return items from the inventory provided below.
- Do NOT invent destinations or items.
- Return JSON ONLY in this exact format:
{"matches":[{"id":number,"reason":string}]}
`;

    const user = `
User request: "${query}"

Inventory (ONLY source of truth):
${JSON.stringify(inventory)}
`;

    // Request OpenAI for the response
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",  // Use the cheapest model for this
      temperature: 0,  // Keep temperature low for determinism
      response_format: { type: "json_object" }, // Forces valid JSON output
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = res.choices[0].message.content;
    if (!raw) return NextResponse.json({ matches: [] });

    // Validate JSON structure
    const parsed = aiResponseSchema.parse(JSON.parse(raw));

    // Filter invalid IDs and attach details from inventory
    const safe = parsed.matches
      .filter((m) => inventory.some((item) => item.id === m.id))
      .map((m) => ({ ...m, ...inventory.find((x) => x.id === m.id)! }));

    return NextResponse.json({ matches: safe });
  } catch (e: any) {
    console.error("OpenAI Search API error:", e);
    return NextResponse.json(
      { matches: [], error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}