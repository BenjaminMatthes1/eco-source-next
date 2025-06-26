// --- config/metricRelevance.ts (new) ---
export type BusinessSize = 'micro' | 'small' | 'medium' | 'large';

export const CATEGORY_WEIGHTS: Record<string, Partial<Record<string, number>>> = {
  // ↓ tune freely or load from CMS later
  'Bioplastics':              { carbonEmissions: 1.4, energyUsage: 1.2 },
  'Recycled Plastics':        { wasteGenerated: 1.5, carbonEmissions: 1.2 },
  'Natural Fibers':           { waterUsage: 1.3, carbonEmissions: 0.8 },
  'Energy & Power':           { energyUsage: 0.6, energyProduction: 1.6 },
  'Recycling & Circularity':  { wasteRecycled: 1.7, carbonOffsets: 1.2 },
};

export const SIZE_WEIGHTS: Record<BusinessSize, Partial<Record<string, number>>> = {
  micro:  { carbonEmissions: 0.5 },
  small:  { carbonEmissions: 0.8 },
  medium: { carbonEmissions: 1.0 },
  large:  { carbonEmissions: 1.3 },
};
