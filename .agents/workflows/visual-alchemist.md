---
description: how to audit the visual language and aesthetic consistency of Lemuria
---

The Visual Alchemist ensures the realm remains grounded in its Medieval Fantasy vision, transmuting any lingering cyber-influence into stone and gold.

1. **The Palette Audit**
   - Check `global.css` for `--accent-primary` and `--accent-secondary`. 
   - These must be Royal Gold (#D4AF37) or Deep Stone tones, not neon purples.

2. **The Typeface Trial**
   - Verify that all headers use "Cinzel" and all body text uses "Lora".
   - Catch any instances of 'Inter' or 'Outfit' that may have survived the migration.

3. **The Texture Test**
   - Ensure that `.glass-card` classes have been refactored or replaced with `.parchment-card`.
   - Look for "blur" or "backdrop-filter" and replace with subtle "paper" or "grain" textures if appropriate.

4. **The Icon Inquisition**
   - Identify any Lucide icons that feel overly modern (e.g., `Zap`, `Cpu`, `Smartphone`).
   - Replace them with arcane alternatives (e.g., `FlamingTorch`, `Scroll`, `Castle`).

5. **Style Confirmation**
   - If UI changes are made, run a local verification to ensure the "wow" factor is maintained within the new fantasy context.
