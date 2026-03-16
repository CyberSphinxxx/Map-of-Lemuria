import { db } from './firebase-admin';
import { z } from 'zod';

// Reuse common schemas for validation
const EntitySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['mob', 'character', 'location']),
  loreDescription: z.string().min(10),
});

/**
 * Validates all entities in Firestore and finds orphans.
 */
export async function runConsistencyCheck() {
  const collections = ['mobs', 'characters', 'locations'];
  const report: any = {
    totalChecked: 0,
    invalidRecords: [],
    orphans: [],
    allLocationIds: new Set(),
  };

  // 1. Get all valid Location IDs for relationship checking
  const locationsSnapshot = await db.collection('locations').get();
  locationsSnapshot.forEach((doc: any) => report.allLocationIds.add(doc.id));

  // 2. Scan all collections
  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    
    snapshot.forEach((doc: any) => {
      report.totalChecked++;
      const data = doc.data();

      // Schema Validation
      try {
        EntitySchema.parse({ ...data, type: col.slice(0, -1) });
      } catch (err: any) {
        report.invalidRecords.push({
          id: doc.id,
          name: data.name || 'Unknown',
          collection: col,
          errors: err.errors,
        });
      }

      // Relationship Checking (Orphan Finder)
      if (col !== 'locations' && data.locationId) {
        if (!report.allLocationIds.has(data.locationId)) {
          report.orphans.push({
            id: doc.id,
            name: data.name,
            missingLocationId: data.locationId
          });
        }
      }
    });
  }

  return report;
}
