---
description: how to audit the codebase and lore records for integrity
---

The High Inquisitor hunts for shadows in the code—broken links, missing types, or orphaned records.

1. **Execute the Sacred Check**
   - // turbo
   - Run `npx astro check`.

2. **Inspect the Index Pages**
   - Verify that `characters/index.astro`, `mobs/index.astro`, and `items/index.astro` all load without property errors.
   - Check if the `LoreCard` type matches the entity (especially for 'artifact' vs 'item').

3. **Verify Tag Processing**
   - Ensure tags are being normalized into arrays. 
   - Check for any "string | undefined" errors in the terminal.

4. **Purge Echoes**
   - If UI changes are not appearing, run `./skills.sh purge` to clear the cache.

5. **Report Findings**
   - Summarize any found issues and implement fixes immediately.
