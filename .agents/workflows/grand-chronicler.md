---
description: how to create new lore entities (characters, mobs, items) for Lemuria
---

The Grand Chronicler ensures that every new inhabitant, beast, or relic added to the archives follows the established laws of the realm.

1. **Understand the Seeker's Request**
   - Identify the type of entity: Character, Mob, or Artifact.
   - Determine the associated region (e.g., Shifting Sands, Silver Spire).

2. **Generate Lore Description**
   - Write a 2-3 paragraph biography or bestiary note.
   - Use a "Medieval Fantasy" tone—heroic, mysterious, or ancient.
   - Avoid modern terminology (no "tech," "digital," or "cyber").

3. **Define Attributes**
   - Characters: Titles, Affiliations (tags), and current location.
   - Mobs: Threat Tier (S-D), Base Vitals (HP/MP/XP), and an observational Drop Table note.
   - Artifacts: Rarity (Legendary, Rare, etc.) and a description of its ancient power.

4. **Construct the Image Vision**
   - Use the `generate_image` tool.
   - **Style Constraint**: "Classical oil painting, medieval fantasy art, detailed, epic lighting, dark fantasy atmosphere."

5. **Commit to the Archives**
   - Use `write_to_file` or `replace_file_content` if adding to a localized mock data file, or instructions to use the Forge API if a creation route exists.
   - (Currently: Guide the user to the Forge or help construct the Firestore data object).

6. **Validate the Entry**
   - Run `./skills.sh audit` to ensure no diagnostic regressions.
