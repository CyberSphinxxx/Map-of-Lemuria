import type { APIRoute } from 'astro';
import { runConsistencyCheck } from '../../lib/consistency-checker';

export const GET: APIRoute = async () => {
  try {
    const report = await runConsistencyCheck();
    // Convert Set to Array for JSON serialization
    report.allLocationIds = Array.from(report.allLocationIds);
    
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
