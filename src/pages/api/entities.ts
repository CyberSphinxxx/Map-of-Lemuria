import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { uploadToBlob } from '../../lib/storage';
import { generateEmbedding } from '../../lib/ai';
import { upsertLoreVector } from '../../lib/pinecone';
import { z } from 'zod';

// Zod schemas for validation
const EntitySchema = z.object({
  type: z.enum(['mob', 'character', 'location', 'artifact'] as const),
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
  // Character specific
  faction: z.string().optional(),
  status: z.enum(['active', 'mia', 'deceased', 'unknown'] as const).optional(),
  // Artifact specific
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] as const).optional(),
  origin: z.string().optional(),
  material: z.string().optional(),
  // Relationship
  locationId: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    // 1. Extract and Validate JSON data FIRST (Fail fast before upload)
    const rawData = formData.get('data') as string;
    if (!rawData) throw new Error('Missing entity data');
    
    const entityData = JSON.parse(rawData);
    const validatedData = EntitySchema.parse(entityData);

    // 2. Handle image with size limits
    const imageFile = formData.get('image') as File | null;
    let imageUrl = '';

    if (imageFile && imageFile.size > 0) {
      // Limit to 5MB
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error('Image size exceeds 5MB limit');
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `entities/${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
      imageUrl = await uploadToBlob(buffer, fileName, imageFile.type);
    }

    // 3. Prepare Firestore document
    const docData = {
      ...validatedData,
      imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: validatedData.tags ? validatedData.tags.split(',').map(t => t.trim()) : [],
    };

    // 4. Save to Firestore
    const collectionName = `${validatedData.type}s`;
    const docRef = await db.collection(collectionName).add(docData);

    // 5. AI/RAG Integration (Non-blocking)
    try {
      const embedding = await generateEmbedding(validatedData.loreDescription);
      await upsertLoreVector(docRef.id, embedding, {
        title: validatedData.name,
        type: validatedData.type,
        content: validatedData.loreDescription,
      });
    } catch (pcError) {
      console.warn('[RAG] Background upsert failed:', pcError);
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
    console.error('[API Entities] Error:', error);
    const status = error instanceof z.ZodError ? 400 : 500;
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
