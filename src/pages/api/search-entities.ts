import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { generateEmbedding } from '../../lib/ai';
import { queryLore } from '../../lib/pinecone';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const mode = url.searchParams.get('mode'); // 'text' (default) or 'semantic'

  try {
    const results: any[] = [];

    // 1. Handle Semantic Search
    if (mode === 'semantic' && query && query.length > 3) {
      const embedding = await generateEmbedding(query);
      const matches = await queryLore(embedding, 10);
      
      return new Response(JSON.stringify(matches.map((m: any) => ({
        id: m.id || 'unknown',
        name: m.title,
        type: m.type,
        score: m.score
      }))), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Handle Basic Text Search (Existing logic)
    const collections = ['mobs', 'characters', 'locations'];
    for (const col of collections) {
      let queryRef: any = db.collection(col);
      
      if (query && query.trim() !== '') {
        queryRef = queryRef
          .where('name', '>=', query)
          .where('name', '<=', query + '\uf8ff')
          .limit(10);
      } else {
        queryRef = queryRef.limit(15);
      }

      const snapshot = await queryRef.get();
      snapshot.forEach((doc: any) => {
        results.push({
          id: doc.id,
          name: doc.data().name,
          type: col.slice(0, -1),
        });
      });
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Search API] Error:', error);
    return new Response(JSON.stringify({ error: 'Search failed', detail: error.message }), { status: 500 });
  }
};
