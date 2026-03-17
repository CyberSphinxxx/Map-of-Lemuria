---
description: how to synchronize Firestore records with the Pinecone vector database
---

The Ley Line Scribe maintains the resonance between the written records and the semantic search engine.

1. **Check Connectivity**
   - Ensure the dev server is running (`npm run dev`).

2. **Invoke the Weaving**
   - // turbo
   - Run `curl -X POST http://localhost:4321/api/reindex`.
   
3. **Verify the Sync**
   - Check the terminal logs to ensure documents were processed successfully.

4. **Test Semantic Search**
   - Call the search-entities API directly or via the chat to ensure new records are retrievable via semantic query.
