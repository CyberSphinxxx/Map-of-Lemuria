import type { APIRoute } from 'astro';
import { generateEmbedding, getLorekeeperResponse } from '../../lib/ai';
import { queryLore } from '../../lib/pinecone';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query, history } = await request.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400 });
    }

    // 1. Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search Pinecone for context
    const matches = await queryLore(queryEmbedding, 5);
    const contextChunks = matches.map((m: any) => `Title: ${m.title}\nType: ${m.type}\nContent: ${m.content}`);

    // 3. Get response from Groq
    const response = await getLorekeeperResponse(query, contextChunks, history || []);

    return new Response(JSON.stringify({ 
      response,
      sources: matches.map((m: any) => ({ title: m.title, type: m.type }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
