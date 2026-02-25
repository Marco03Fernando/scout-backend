import { NextRequest, NextResponse } from 'next/server'; // Import necessary tools from next/server
import { OpenAI } from 'openai'; // OpenAI import
import { inventory } from '@/lib/inventory'; // Assuming this exists
import { aiResponseSchema } from '@/lib/schema'; // Assuming this exists

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Ensure this API key is set in `.env.local`
});

// POST method handler using NextResponse
export async function POST(req: NextRequest) {
  try {
    // Set CORS headers in the response directly
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', 'https://travel-front-alpha.vercel.app');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Parse the incoming JSON request body
    const { query } = await req.json();

    // Return an empty response if there's no query
    if (!query || !query.trim()) {
      return NextResponse.json({ matches: [] }, { status: 200 });
    }

    // Define the system and user prompt for OpenAI
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
    const openaiRes = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const raw = openaiRes.choices[0].message.content; // Get the raw response content

    // If there's no content, return empty matches
    if (!raw) {
      return NextResponse.json({ matches: [] }, { status: 200 });
    }

    // Parse the response and validate using the schema
    const parsed = aiResponseSchema.parse(JSON.parse(raw));

    // Filter invalid matches and merge with inventory details
    const safeMatches = parsed.matches
      .filter((match) => inventory.some((item) => item.id === match.id))
      .map((match) => ({ ...match, ...inventory.find((item) => item.id === match.id)! }));

    // Return the safe matches
    return NextResponse.json({ matches: safeMatches }, { status: 200 });
  } catch (e: any) {
    console.error('OpenAI Search API error:', e);
    
    // Return error response if something goes wrong
    return NextResponse.json({
      matches: [],
      error: e?.message || 'Unknown error',
    }, { status: 500 });
  }
}