import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  try {
    // Basic search across collections
    const collections = ['mobs', 'characters', 'locations'];
    const results: any[] = [];

    for (const col of collections) {
      const snapshot = await db.collection(col)
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .limit(5)
        .get();
      
      snapshot.forEach(doc => {
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
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500 });
  }
};
