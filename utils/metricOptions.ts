export const RAW_METRICS = [
    { key: 'energyUsage', label: 'Energy Usage' },
    { key: 'energyProduction', label: 'Energy Production' },
    { key: 'waterUsage', label: 'Water Usage' },
    { key: 'waterRecycled', label: 'Water Recycled' },
    { key: 'carbonEmissions', label: 'Carbon Emissions' },
    { key: 'carbonOffsets', label: 'Carbon Offsets' },
    { key: 'wasteGenerated', label: 'Waste Generated' },
    { key: 'wasteRecycled', label: 'Waste Recycled' },
    { key: 'packagingRecyclability', label: 'Packaging Recyclability (%)' },
    { key: 'biodiversityImpact', label: 'Biodiversity Impact (0–10)' },
    { key: 'localSourcing', label: 'Local Sourcing (%)' },
    { key: 'supplierFairTrade', label: 'Supplier Fair Trade (%)' },
    { key: 'supplierLivingWage', label: 'Supplier Living Wage (%)' },
    { key: 'communityEngagement', label: 'Community Engagement (0–10)' },
    { key: 'recyclable', label: 'Recyclable (boolean)' },
    { key: 'costEffectiveness', label: 'Allow Peer Cost Rating' },
    { key: 'economicViability', label: 'Allow Peer EV Rating' },
    { key: 'materials', label: 'Materials Array' },
  ];

  // 1)  Array you already use elsewhere (`key` & `label`)
export const SERVICE_METRICS = RAW_METRICS;
export const ITEM_METRICS = RAW_METRICS;

// 2)  react‑select‑ready array (`value` & `label`)
export const METRIC_SELECT_OPTIONS = RAW_METRICS.map(({ key, label }) => ({
  value: key,
  label,
}));

export const metricLabel = (key: string) =>
  RAW_METRICS.find((m) => m.key === key)?.label ?? key;