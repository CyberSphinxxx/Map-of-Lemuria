import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { generateEmbedding } from '../../lib/ai';
import { upsertLoreVector } from '../../lib/pinecone';

export const POST: APIRoute = async ({ cookies }) => {
  // Authorization check (simplified)
  const session = cookies.get('__session')?.value;
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const collections = ['mobs', 'characters', 'locations'];
    let totalIndexed = 0;

    for (const col of collections) {
      const snapshot = await db.collection(col).get();
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const content = `${data.name} ${data.titles || ''} ${data.loreDescription || ''}`;
        
        const embedding = await generateEmbedding(content);
        await upsertLoreVector(doc.id, embedding, {
          id: doc.id,
          title: data.name,
          type: col.slice(0, -1),
          content: data.loreDescription?.substring(0, 200) || '',
        });
        
        totalIndexed++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully reindexed ${totalIndexed} entries.` 
    }), { status: 200 });

  } catch (error: any) {
    console.error('[Reindex API] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
