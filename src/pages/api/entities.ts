import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { uploadToBlob } from '../../lib/storage';
import { generateEmbedding } from '../../lib/ai';
import { upsertLoreVector } from '../../lib/pinecone';
import { z } from 'zod';

// Zod schemas for validation
const EntitySchema = z.object({
  type: z.enum(['mob', 'character', 'location'] as const),
  name: z.string().min(1),
  titles: z.string().optional(),
  tags: z.string().optional(),
  loreDescription: z.string().min(10),
  // Mob specific
  baseStats: z.record(z.string(), z.number()).optional(),
  threatTier: z.string().optional(),
  dropTable: z.string().optional(),
  // Location specific
  mapCoordinates: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  // Relationship
  locationId: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    // Extract file
    const imageFile = formData.get('image') as File | null;
    let imageUrl = '';

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `entities/${Date.now()}-${imageFile.name}`;
      imageUrl = await uploadToBlob(buffer, fileName, imageFile.type);
    }

    // Extract JSON data
    const rawData = formData.get('data') as string;
    const entityData = JSON.parse(rawData);
    
    // Validate
    const validatedData = EntitySchema.parse(entityData);

    // Prepare Firestore document
    const docData = {
      ...validatedData,
      imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure tags are split into an array
      tags: validatedData.tags ? validatedData.tags.split(',').map(t => t.trim()) : [],
    };

    // Save to Firestore
    const collectionName = `${validatedData.type}s`;
    const docRef = await db.collection(collectionName).add(docData);

    // AI/RAG Integration: Embed and Upsert to Pinecone
    try {
      const embedding = await generateEmbedding(validatedData.loreDescription);
      await upsertLoreVector(docRef.id, embedding, {
        title: validatedData.name,
        type: validatedData.type,
        content: validatedData.loreDescription,
      });
    } catch (pcError) {
      console.error('Failed to upsert to Pinecone:', pcError);
      // We don't fail the request if RAG fails, but we log it.
    }

    return new Response(JSON.stringify({ 
      success: true, 
      id: docRef.id,
      imageUrl 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error creating entity:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to create entity' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
