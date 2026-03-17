
/**
 * Lore Scribe Helper
 * Converts raw entity data into structured JSON for the Archives.
 */

function createEntity(type, data) {
  const base = {
    name: data.name || "Unknown Entry",
    loreDescription: data.description || "No records exist.",
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',') : []),
    imageUrl: data.imageUrl || ""
  };

  switch(type) {
    case 'character':
      return {
        ...base,
        titles: data.titles || "Notable Inhabitant",
        locationId: data.locationId || "wilderness"
      };
    case 'mob':
      return {
        ...base,
        threatTier: data.threatTier || "D",
        baseStats: data.stats || { hp: 100, mp: 50, xp: 10 },
        dropTable: data.drops || ""
      };
    case 'artifact':
      return {
        ...base,
        rarity: data.rarity || "Common"
      };
    default:
      return base;
  }
}

// Example usage can be added here or called from a CLI
module.exports = { createEntity };
