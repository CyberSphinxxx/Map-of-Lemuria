import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Helper to get environment variables from both import.meta.env (Astro Local) 
 * and process.env (Vercel Runtime).
 */
const getEnvVar = (key: string) => {
  return (process.env[key] || (import.meta as any).env?.[key]) as string | undefined;
};

const getSafeClient = () => {
  const apiKey = getEnvVar('PINECONE_API_KEY');
  if (!apiKey) return null;

  try {
    return new Pinecone({ apiKey });
  } catch (e) {
    console.error('[Pinecone] Client initialization failed:', e);
    return null;
  }
};

/**
 * Resilient Pinecone Client.
 */
export const pineconeClient: Pinecone = new Proxy({} as Pinecone, {
  get(target, prop) {
    const pc = getSafeClient();
    if (!pc) {
      throw new Error('[Pinecone] PINECONE_API_KEY is missing. Please check your .env file or Vercel Environment Variables.');
    }
    const value = (pc as any)[prop];
    return typeof value === 'function' ? value.bind(pc) : value;
  }
});

/**
 * Resilient Pinecone Index.
 */
export const pineconeIndex = new Proxy({} as any, {
  get(target, prop) {
    const pc = getSafeClient();
    if (!pc) {
      throw new Error('[Pinecone] Cannot access index: PINECONE_API_KEY is missing.');
    }
    const indexName = getEnvVar('PINECONE_INDEX') || 'lemuria-lore';
    const index = pc.index<any>(indexName);
    const value = (index as any)[prop];
    return typeof value === 'function' ? value.bind(index) : value;
  }
});

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

  return queryResponse.matches.map((match: any) => ({
    id: match.id,
    content: match.metadata?.content || '',
    title: match.metadata?.title || '',
    type: match.metadata?.type || '',
    score: match.score,
  }));
}
