import { Pinecone } from '@pinecone-database/pinecone';

const env = import.meta.env || {};
const proc = process.env || {};

const pc = new Pinecone({
  apiKey: env['PINECONE_API_KEY'] || proc['PINECONE_API_KEY'] || '',
});
export const pineconeClient = pc;

const INDEX_NAME = env['PINECONE_INDEX'] || proc['PINECONE_INDEX'] || 'lemuria-lore';

export const pineconeIndex = pc.index<any>(INDEX_NAME);

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
    id: match.id,
    content: match.metadata?.content || '',
    title: match.metadata?.title || '',
    type: match.metadata?.type || '',
    score: match.score,
  }));
}
