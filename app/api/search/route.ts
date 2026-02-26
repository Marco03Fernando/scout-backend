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
  const response = NextResponse.next();

  // CORS Headers for preflight (OPTIONS) and actual requests (POST)
  response.headers.set('Access-Control-Allow-Origin', 'https://travel-front-alpha.vercel.app');  // Allow requests from your frontend
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  // Allow GET, POST, OPTIONS methods
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type header

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    console.log('CORS Preflight request received');
    return response; // Respond with CORS headers for preflight requests
  }

  try {
    // Log to check if request body is being parsed correctly
    console.log('Request received');
    
    // Parse the incoming JSON request body
    const { query } = await req.json();
    console.log('Query:', query); // Log the received query

    // Return an empty response if there's no query
    if (!query || !query.trim()) {
      console.log('No query provided or query is empty');
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
    console.log('Sending request to OpenAI...'); // Log before sending request to OpenAI

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
    console.log('OpenAI Response:', raw); // Log OpenAI response

    // If there's no content, return empty matches
    if (!raw) {
      console.log('No content in OpenAI response');
      return NextResponse.json({ matches: [] }, { status: 200 });
    }

    // Parse the response and validate using the schema
    const parsed = aiResponseSchema.parse(JSON.parse(raw));
    console.log('Parsed response:', parsed); // Log parsed response

    // Filter invalid matches and merge with inventory details
    const safeMatches = parsed.matches
      .filter((match) => inventory.some((item) => item.id === match.id))
      .map((match) => ({ ...match, ...inventory.find((item) => item.id === match.id)! }));

    // Return the safe matches
    console.log('Returning matches:', safeMatches);
    return NextResponse.json({ matches: safeMatches }, { status: 200 });
  } catch (e: any) {
    console.error('OpenAI Search API error:', e); // Log any error in the console
    
    // Return error response if something goes wrong
    return NextResponse.json({
      matches: [],
      error: e?.message || 'Unknown error',
    }, { status: 500 });
  }
}