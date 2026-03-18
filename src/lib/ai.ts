import Groq from 'groq-sdk';
import { pineconeClient } from './pinecone';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates embeddings for lore chunks.
 * Uses Pinecone's Inference API for real-world vector generation.
 * TARGET MODEL: multilingual-e5-large (1024 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!text || text.length < 2) {
      console.warn('[AI] Text too short for embedding, returning zero vector');
      return new Array(1024).fill(0);
    }

    const embeddings = await pineconeClient.inference.embed({
      model: 'multilingual-e5-large',
      inputs: [text],
      parameters: { inputType: 'passage', truncate: 'END' }
    });

    // Pinecone returns an array-like object with .values on individual items
    const vector = (embeddings.data?.[0] as any)?.values;
    if (!vector || vector.length !== 1024) {
      throw new Error(`Invalid vector dimension: expected 1024, got ${vector?.length}`);
    }

    return vector as number[];
  } catch (error) {
    console.error('[AI] Embedding generation failed:', error);
    // Return a zero vector as a stable fallback instead of random noise
    return new Array(1024).fill(0);
  }
}

const SYSTEM_PROMPT = `
You are the Lorekeeper, the ancient guardian of the archives of Lemuria. 
Your knowledge is vast but strictly limited to the provided lore chunks.

RULES:
1. Speak in a formal, wise, and slightly archaic tone.
2. ONLY answer based on the provided context chunks.
3. If the answer is not in the context, strictly state: "I have no knowledge of that in the archives."
4. Refuse to answer out-of-scope or real-world questions.
5. Do not break character.
`;

export async function getLorekeeperResponse(
  query: string,
  contextChunks: string[],
  chatHistory: { role: 'user' | 'assistant', content: string }[]
) {
  const context = contextChunks.join('\n\n---\n\n');
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory,
    { role: 'user', content: `Context from archives:\n${context}\n\nQuestion: ${query}` }
  ];

  const completion = await groq.chat.completions.create({
    messages: messages as any,
    model: 'llama3-70b-8192', // or any other Groq supported model
    temperature: 0.2,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "The archives are silent on this matter.";
}
