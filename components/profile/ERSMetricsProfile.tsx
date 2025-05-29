/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useMemo } from 'react';
import CircularScore from '@/components/ui/circularScore';
import {
  calculateUserLevelScore,
  DynamicInputs,
} from '@/services/ersMetricsService';

/* ------------------------------------------------------------------ */
/*  1. helpers: unit lookup + value formatter                          */
/* ------------------------------------------------------------------ */
const energyKeys  = ['totalEnergyConsumption', 'totalEnergyProduction'];
const waterKeys   = ['totalWaterUse'];
const carbonKeys  = ['totalCarbonFootprint', 'carbonOffsets'];
const wasteKeys   = ['wasteGenerated', 'wasteDiverted'];

function standardUnit(key: string): string {
  if (energyKeys.includes(key))  return 'kWh';
  if (waterKeys.includes(key))   return 'L';
  if (carbonKeys.includes(key))  return 'kg';
  if (wasteKeys.includes(key))   return 'kg';
  return '';
}

/** convert and stringify any metric value so React can render it **/
function formatMetricValue(key: string, raw: any): string {
  if (raw == null) return '—';

  /* numbers with optional { value, unit } object structure */
  if (typeof raw === 'number') return raw.toLocaleString();
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No';

  // array of uploaded docs → “3 docs (2 verified)”
  if (Array.isArray(raw)) {
    if (key === 'uploadedDocuments') {
      const verified = raw.filter((d) => d.verified).length;
      return `${raw.length} docs (${verified} verified)`;
    }
    return `${raw.length}`;
  }

  // object with { value, unit }
  if (typeof raw === 'object' && 'value' in raw && 'unit' in raw) {
    const { value, unit } = raw as { value: number; unit: string };
    const val = convertToStandard(key, value, unit);
    return `${val.toLocaleString()} ${standardUnit(key)}`;
  }

  // fallback stringify
  return raw.toString();
}

/** conversion logic (matches your snippet) */
function convertToStandard(
  metricKey: string,
  value: number,
  unit: string
): number {
  // Energy (-> kWh)
  if (energyKeys.includes(metricKey)) {
    switch (unit.toLowerCase()) {
      case 'mj':
        return value * 0.2778;
      case 'mwh':
        return value * 1000;
      default:
        return value; // assume kWh
    }
  }
  // Water (-> L)
  if (waterKeys.includes(metricKey)) {
    switch (unit.toLowerCase()) {
      case 'gallons':
        return value * 3.785;
      default:
        return value; // assume liters
    }
  }
  // Carbon (-> kg)
  if (carbonKeys.includes(metricKey)) {
    switch (unit.toLowerCase()) {
      case 'tons':
      case 'tonnes':
        return value * 1000;
      default:
        return value; // assume kg
    }
  }
  // Waste (-> kg)
  if (wasteKeys.includes(metricKey)) {
    switch (unit.toLowerCase()) {
      case 'tons':
        return value * 1000;
      case 'lbs':
        return value * 0.453592;
      default:
        return value;
    }
  }
  return value;
}

/* ------------------------------------------------------------------ */
/*  2. component                                                       */
/* ------------------------------------------------------------------ */
export default function ERSMetricsProfile({
  chosenMetrics = [],
  metrics = {},
  overall,
}: DynamicInputs & { overall?: number }) {
  /* compute overall if API omitted it */
  const score = useMemo(() => {
    if (overall !== undefined) return overall;
    return Math.round(
      calculateUserLevelScore({ chosenMetrics, metrics }).score
    );
  }, [overall, chosenMetrics, metrics]);

  return (
    <div className="bg-neutral rounded-lg shadow p-6 text-primary w-full">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <CircularScore score={score} size={120} stroke={12} />

        <div className="flex-1 grid grid-cols-2 gap-4">
          {chosenMetrics.map((k) => (
            <div key={k}>
              <p className="text-[12px] uppercase mb-0.5">{k}</p>
              <p className="text-sm font-redditLight">
                {formatMetricValue(k, metrics[k])}
                {typeof metrics[k] === 'number' && ` ${standardUnit(k)}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
