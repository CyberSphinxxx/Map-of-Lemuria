import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const INDEX_NAME = process.env.PINECONE_INDEX || 'lemuria-lore';

export const pineconeIndex = pc.index(INDEX_NAME);

/**
 * Upserts a lore chunk to Pinecone with its embedding.
 * @param id - Document ID.
 * @param vector - The embedding vector.
 * @param metadata - Metadata (title, type, content snippet).
 */
export async function upsertLoreVector(
  id: string,
  vector: number[],
  metadata: any
) {
  await pineconeIndex.upsert({
    records: [
      {
        id,
        values: vector,
        metadata,
      },
    ],
  });
}

/**
 * Queries Pinecone for relevant lore chunks.
 * @param vector - The query embedding vector.
 * @param topK - Number of results to return.
 * @returns Relevant lore chunks.
 */
export async function queryLore(vector: number[], topK: number = 5) {
  const queryResponse = await pineconeIndex.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return queryResponse.matches.map(match => ({
    content: match.metadata?.content || '',
    title: match.metadata?.title || '',
    type: match.metadata?.type || '',
    score: match.score,
  }));
}
