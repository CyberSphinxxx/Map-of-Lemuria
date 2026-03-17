#!/bin/bash
# Lemuria Archive Management Toolkit

# Support for Windows/Git Bash
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    EXE_ASTRO="npx astro"
else
    EXE_ASTRO="npx astro"
fi

case $1 in
  "audit")
    echo "📜 Invoking the High Inquisitor... (Astro Check)"
    $EXE_ASTRO check
    ;;
  "weave")
    echo "✨ Weaving the Ley Lines... (Pinecone Reindex)"
    curl -X POST http://localhost:4321/api/reindex
    ;;
  "purge")
    echo "🧹 Purging Corrupted Echoes... (Clean Cache)"
    rm -rf .astro dist node_modules/.vite
    echo "Done."
    ;;
  "help"|*)
    echo "Lemuria Archive Toolkit"
    echo "------------------------"
    echo "Usage: ./skills.sh {audit|weave|purge}"
    echo ""
    echo "audit: Validate code and lore integrity"
    echo "weave: Resync Firestore with Pinecone Ley Lines"
    echo "purge: Reset the local archives and cache"
    ;;
esac
