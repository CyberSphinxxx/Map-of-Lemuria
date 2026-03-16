import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates embeddings for lore chunks.
 * TARGET MODEL: llama-text-embed-v2 (1024 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // NOTE: This is a placeholder. 
  // Integration: Use pc.inference.embeddings() with model='llama-text-embed-v2'
  // Or use a Groq/Nomic local embedding.
  // The vector MUST be 1024 dimensions to match the Pinecone index setup.
  
  console.log(`Generating embedding for: ${text.substring(0, 30)}...`);
  return new Array(1024).fill(0).map(() => Math.random());
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
