export interface LoreEntity {
  id: string;
  name?: string;
  loreDescription?: string;
  imageUrl?: string;
  tags?: string | string[];
  [key: string]: any;
}

export interface CharacterEntity extends LoreEntity {
  type: 'character';
  titles?: string;
  status?: string;
}

export interface MobEntity extends LoreEntity {
  type: 'mob';
  threatTier?: string;
  baseStats?: {
    hp?: number;
    [key: string]: any;
  };
  dropTable?: string;
}

export interface LocationEntity extends LoreEntity {
  type: 'location';
  mapCoordinates?: {
    x: number;
    y: number;
  };
  regionId?: string;
}

export interface ArtifactEntity extends LoreEntity {
  type: 'artifact';
  rarity?: string;
}
