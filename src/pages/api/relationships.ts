import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { z } from 'zod';

const RelationshipSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  type: z.string().optional(), // e.g., 'evolution', 'parent', 'creation'
  metadata: z.record(z.string(), z.any()).optional(),
});

export const GET: APIRoute = async () => {
  try {
    const snapshot = await db.collection('relationships').get();
    const relationships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return new Response(JSON.stringify(relationships), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validated = RelationshipSchema.parse(body);

    const docRef = await db.collection('relationships').add({
      ...validated,
      createdAt: new Date().toISOString()
    });

    return new Response(JSON.stringify({ id: docRef.id }), { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

  try {
    await db.collection('relationships').doc(id).delete();
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
