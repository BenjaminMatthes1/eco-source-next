
import { CATEGORY_WEIGHTS, SIZE_WEIGHTS, BusinessSize } from '@/config/metricRelevance';
import { peerRatingScore } from '@/utils/reviewCredibility';

export interface DynamicInputs {
  chosenMetrics: string[];
  metrics: Record<string, any>;  // synergy fields, e.g. { "energyUsage": {value,unit}, "peerCostEffectiveness": {...}, ... }
}


//
// If you want a separate interface for user synergy:
//
export interface DynamicUserInputs {
  chosenMetrics: string[];
  metrics: Record<string, any>;
}

export interface ScoringContext {
  category?: string;          // primary category slug
  businessSize?: BusinessSize;
}

/* weight helper */
function metricWeight(key: string, ctx?: ScoringContext): number {
  let w = 1;
  if (ctx?.category)     w *= CATEGORY_WEIGHTS[ctx.category]?.[key]     ?? 1;
  if (ctx?.businessSize) w *= SIZE_WEIGHTS[ctx.businessSize]?.[key]     ?? 1;
  return w;
}

/* Metric Explainer */
export interface MetricExplainer {
  raw: any;
  normalised: number;   // 0-1 after unit-convert & ratio math
  weight: number;       // context-adjusted weight
  contribution: number; // normalised × weight
}
type Explanation = Record<string, MetricExplainer>;

export interface ScoreResult {
  score: number;         // final synergy 0..100
  dataStatus: string;    // "INSUFFICIENT_DATA", "LIMITED_DATA", or "OK"
  explanation: Explanation;
}

/** 
 * Helper: ensure non-negative, treat NaN as 0.
 */
function clampNonNegative(value: number): number {
  if (!value || Number.isNaN(value)) return 0;
  return Math.max(0, value);
}

/** 
 * Convert a usage or offset object => number. 
 * e.g. { value: 5, unit: 'kWh' } => do unit conversion => then clamp
 */
function parseNumeric(metricKey: string, raw: any): number {
  if (!raw) return 0;

  // If raw is just a number, clamp:
  if (typeof raw === 'number') {
    return clampNonNegative(raw);
  }

  // If it's { value, unit }, do your typical convertToStandard:
  if (raw.value !== undefined) {
    const val =
     typeof raw.value === 'number'
       ? clampNonNegative(raw.value)
       : clampNonNegative(parseFloat(raw.value));
    const unit = typeof raw.unit === 'string' ? raw.unit : '';
    return convertToStandard(val, unit, metricKey);
  }

  // If it's a string, parse float
  if (typeof raw === 'string') {
    const parsed = parseFloat(raw);
    return clampNonNegative(parsed);
  }

  // fallback
  return 0;
}

/**
 * Convert numeric metric from user-chosen unit to a standard base (kWh, liters, kg, etc.).
 * You can adapt or expand these conversions.
 */
function convertToStandard(value: number, unit: string, metricKey: string): number {
  // If value is negative or NaN, clamp it
  value = clampNonNegative(value);

  // Our known categories
  const energyKeys = ['energyUsage', 'energyProduction', 'totalEnergyConsumption', 'totalEnergyProduction'];
  const waterKeys  = ['waterUsage', 'waterRecycled'];
  const carbonKeys = ['carbonEmissions', 'carbonOffsets', 'totalCarbonFootprint'];
  const wasteKeys  = ['wasteGenerated', 'wasteRecycled'];

  // Energy => standard is kWh
  if (energyKeys.includes(metricKey)) {
    switch (unit.toLowerCase()) {
      case 'mj':
        return value * 0.2778; // 1 MJ ~ 0.2778 kWh
      case 'mwh':
        return value * 1000;   // 1 MWh = 1000 kWh
      default:
        return value;          // assume kWh or unknown => no conversion
    }
  }

  // Water => standard is liters
  if (waterKeys.includes(metricKey)) {
    switch (unit.toLowerCase()) {
      case 'gallons':
        return value * 3.785;
      default:
        return value; // assume liters
    }
  }

  // Carbon => standard is kg
  if (carbonKeys.includes(metricKey)) {
    switch (unit.toLowerCase()) {
      case 'tons':
      case 'tonnes':
        return value * 1000; // 1 metric ton = 1000 kg
      default:
        return value;        // assume kg
    }
  }

  // Waste => standard is kg
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

  // fallback
  return value;
}

/**
 * Score usage vs. production ratio:
 *   net = usage - production,
 *   ratio = net/usage => subScore= 1 - ratio
 * e.g. usage=5, production=3 => net=2 => ratio=2/5=0.4 => subScore=0.6
 */
function scoreUsageWithRatio(usage: number, production: number): number {
  usage = clampNonNegative(usage);
  production = clampNonNegative(production);
  if (usage === 0) {
    // no usage => subScore=1
    return 1;
  }
  const net = clampNonNegative(usage - production);
  const ratio = net / usage; // 0..1
  return Math.max(0, 1 - ratio);
}

/** Similarly for water usage vs. recycled. */
function scoreWaterWithRatio(usage: number, recycled: number): number {
  usage = clampNonNegative(usage);
  recycled = clampNonNegative(recycled);
  if (usage === 0) return 1; // no water => subScore=1
  const net = clampNonNegative(usage - recycled);
  const ratio = net / usage; 
  return Math.max(0, 1 - ratio);
}

/** Carbon => net= carbon-offsets => ratio= net/carbon => subScore=1 - ratio */
function scoreCarbonWithRatio(carbon: number, offsets: number): number {
  carbon = clampNonNegative(carbon);
  offsets = clampNonNegative(offsets);
  if (carbon === 0) return 1;
  const net = clampNonNegative(carbon - offsets);
  const ratio = net / carbon;
  return Math.max(0, 1 - ratio);
}



/** e.g. packagingRecyclability => 0..100 => direct ratio. */
function scorePercentage(rawVal: number): number {
  const clamped = Math.max(0, Math.min(100, rawVal));
  return clamped / 100;
}

/** Simple boolean => 1 or 0. You might reduce it to 0.5 if you like. */
function scoreBoolean(value: boolean): number {
  return value ? 1 : 0;
}

/** 
 * Items can have synergy metrics like "materials" array, 
 * "ethicalPractices" array => partial. 
 * For materials => see if there's a ratio of recycled, a boolean renewable, etc.
 */

/** ---------------  ITEM-LEVEL SCORING --------------- **/
export function calculateERSItemScore(inputs: DynamicInputs, context?: ScoringContext): ScoreResult {
  const { chosenMetrics, metrics } = inputs;
  const explain: Explanation = {};
  let totalScore = 0;
  let totalWeight = 0;
  let knownCount = 0;

  // Precompute ratio-based net usage for energy/water/carbon:
  const usageVal  = parseNumeric('energyUsage', metrics.energyUsage);
  const prodVal   = parseNumeric('energyProduction', metrics.energyProduction);
  const energySub = scoreUsageWithRatio(usageVal, prodVal);

  const waterVal  = parseNumeric('waterUsage', metrics.waterUsage);
  const waterRec  = parseNumeric('waterRecycled', metrics.waterRecycled);
  const waterSub  = scoreWaterWithRatio(waterVal, waterRec);

  const carbonVal = parseNumeric('carbonEmissions', metrics.carbonEmissions);
  const offsetVal = parseNumeric('carbonOffsets', metrics.carbonOffsets);
  const carbonSub = scoreCarbonWithRatio(carbonVal, offsetVal);

  for (const key of chosenMetrics) {
    const rawVal = metrics[key];
    const w = metricWeight(key, context);
    if (rawVal === undefined || rawVal === 'N/A') {
       /* field not provided → ignore weight & score */
      continue; 
    }
    if (rawVal === 'unknown') {
      // penalize => subScore=0, weight=1
      totalWeight += w;          // penalise with weighted 0
      continue;
    }
    knownCount++;

    switch (key) {
      // Materials => partial synergy
      case 'materials': {
        if (Array.isArray(rawVal) && rawVal.length > 0) {
          let sumRecycle = 0;
          let renewableCount = 0;
          rawVal.forEach((m: any) => {
            const pr = clampNonNegative(m.percentageRecycled || 0); 
            if (pr > 100) { 
              // clamp over 100
              sumRecycle += 100;
            } else {
              sumRecycle += pr;
            }
            if (m.isRenewable) renewableCount++;
          });
          const avgRecycle = sumRecycle / rawVal.length; // 0..100
          const recycleRatio = Math.min(avgRecycle / 100, 1);
          const renewRatio   = renewableCount / rawVal.length; // 0..1
          let combined = recycleRatio + renewRatio;
          // if you want to limit it, you can do if (combined>1) combined=1
          if (combined > 1) combined=1;
          totalScore  += combined * w;
          totalWeight += w;
          explain[key] = { raw: rawVal, normalised: combined, weight: w, contribution: combined * w };
        }
        break;
      }

      // energy usage => use ratio if key=== 'energyUsage'
      // otherwise skip so we don't double-count
      case 'energyUsage':
        // We already computed energySub. Let's add it once:
        totalScore  += energySub * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: energySub, weight: w, contribution: energySub * w };
        break;
      case 'energyProduction':
        explain[key] = {
          raw: rawVal,
          normalised: energySub,   // same ratio value
          weight: w,
          contribution: 0,         // not counted
        };
        // skip to avoid double count
        break;

      // water
      case 'waterUsage':
        totalScore  += waterSub * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: waterSub, weight: w, contribution: waterSub * w };
        break;
      case 'waterRecycled':
        explain[key] = {
          raw: rawVal,
          normalised: waterSub,   // same ratio value
          weight: w,
          contribution: 0,         // not counted
        };
        // skip
        break;

      // carbon
      case 'carbonEmissions':
        totalScore  += carbonSub * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: carbonSub, weight: w, contribution: carbonSub * w };
        break;
      case 'carbonOffsets':
        explain[key] = {
          raw: rawVal,
          normalised: carbonSub,   // same ratio value
          weight: w,
          contribution: 0,         // not counted
        };
        // skip
        break;

      // packaging => 0..100 => ratio
      case 'packagingRecyclability': {
        const pct = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal);
        totalScore  += scorePercentage(pct) * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: scorePercentage(pct), weight: w, contribution: scorePercentage(pct) * w };
        break;
      }

      // boolean => e.g. recyclable
      case 'recyclable': {
        const boolVal = !!rawVal;
        totalScore  += scoreBoolean(boolVal) * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: scoreBoolean(boolVal), weight: w, contribution: scoreBoolean(boolVal) * w };
        break;
      }

      // localSourcing => 0–100 %
      case 'localSourcing': {
        const pct   = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal);
        const norm  = scorePercentage(pct);
        totalScore  += norm * w;
        totalWeight += w;
        explain[key] = {
          raw: rawVal,
          normalised: norm,
          weight: w,
          contribution: norm * w,
        };
        break;
      }

      // costEffectiveness => { average, count }
      case 'costEffectiveness': {
        const sub = peerRatingScore(rawVal);
        totalScore  += sub * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: sub, weight: w, contribution: sub * w };
        break;
      }

      // economicViability => { average, count }
      case 'economicViability': {
        const sub = peerRatingScore(rawVal);
        totalScore += sub;
        totalWeight++;
        explain[key] = { raw: rawVal, normalised: sub, weight: w, contribution: sub * w };
        break;
      }

      // ethicalPractices => array => partial
      case 'ethicalPractices':
        if (Array.isArray(rawVal)) {
          // e.g. each practice => +0.2 up to 1
          const subScore = Math.min(rawVal.length * 0.2, 1);
          totalScore  += subScore * w;
          totalWeight += w;
          explain[key] = { raw: rawVal, normalised: subScore, weight: w, contribution: subScore * w };
        }
        break;

        case 'uploadedDocuments': {
          /* Products & Services store their certs here */
          if (!Array.isArray(rawVal)) {
            totalWeight++;                    // field chosen but empty → 0 score
            break;
          }
        
          const verified = rawVal.filter(d => d.verified).length;
          const pending  = rawVal.filter(
            d => !d.verified && !d.rejectionReason
          ).length;
        
          /* pending worth half, verified full */
          const rawScore = verified + pending * 0.5;
        
          /* full weight once combined‑score ≥ 5 */
          totalScore  += Math.min(rawScore / 5, 1) * w;
          totalWeight += w;
          explain[key] = { raw: rawVal, normalised: rawScore, weight: w, contribution: rawScore * w };
          break;
        }

      default:
        // if there's some other synergy key, you can handle it here
        break;
    }
  }

  // Data checks
  if (knownCount < 3) {
    return { score: 0, dataStatus: 'INSUFFICIENT_DATA', explanation: explain };
  }
  let dataStatus = knownCount <= 5 ? 'LIMITED_DATA' : 'OK';

  if (totalWeight === 0) {
    return { score: 0, dataStatus: 'INSUFFICIENT_DATA', explanation: explain };
  }

  const final = Math.round((totalScore / totalWeight) * 100);
  return { score: final, dataStatus, explanation: explain };
}

/** ---------------  USER-LEVEL SCORING --------------- **/
export function calculateUserLevelScore(inputs: DynamicUserInputs, context?: ScoringContext): ScoreResult {
  const { chosenMetrics, metrics } = inputs;
  const explain: Explanation = {};
  let totalScore = 0;
  let totalWeight = 0;
  let knownCount = 0;

  // ratio approach for user-level synergy:
  // net energy => usage - production
  const totalEnergyVal = parseNumeric('totalEnergyConsumption', metrics.totalEnergyConsumption);
  const producedEnergyVal = parseNumeric('totalEnergyProduction', metrics.totalEnergyProduction);
  const energySub = scoreUsageWithRatio(totalEnergyVal, producedEnergyVal);

  // net carbon => footprint - offsets
  const totalCarbonVal = parseNumeric('totalCarbonFootprint', metrics.totalCarbonFootprint);
  const offsetsVal     = parseNumeric('carbonOffsets',        metrics.carbonOffsets);
  const carbonSub      = scoreCarbonWithRatio(totalCarbonVal, offsetsVal);

  for (const key of chosenMetrics) {
    const rawVal = metrics[key];
    const w = metricWeight(key, context);
    if (rawVal === undefined || rawVal === 'N/A')
      continue; 
    if (rawVal === 'unknown') {
      totalWeight += w;
      continue;
    }
    knownCount++;

    switch (key) {
      // totalEnergy => we do ratio once:
      case 'totalEnergyConsumption':
        totalScore  += energySub * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: energySub, weight: w, contribution: energySub * w };
        break;
      case 'totalEnergyProduction':
        explain[key] = {
          raw: rawVal,
          normalised: energySub,   // same ratio value
          weight: w,
          contribution: 0,         // not counted
        };
        // skip double
        break;

      // totalCarbon => ratio
      case 'totalCarbonFootprint':
        totalScore  += carbonSub * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: carbonSub, weight: w, contribution: carbonSub * w };
        break;
      case 'carbonOffsets':
        explain[key] = {
          raw: rawVal,
          normalised: carbonSub,   // same ratio value
          weight: w,
          contribution: 0,         // not counted
        };
        // skip double
        break;

      // philanthropicDonations => 0..100 => direct ratio
      case 'philanthropicDonations':
      case 'charitableDonationsPercent': {
        let num = parseFloat(rawVal);
        if (Number.isNaN(num)) num=0;
        num = Math.max(0, Math.min(100, num)); // 0..100
        totalScore  += (num / 100) * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: num, weight: w, contribution: num * w };
        break;
      }

      
      // or user docs => treat similarly
      case 'uploadedDocuments': {
        const docs      = Array.isArray(rawVal) ? rawVal : [];
        const verified  = docs.filter(d => d.verified).length;
        const pending   = docs.filter(d => !d.verified && !d.rejectionReason).length;
        const rawScore  = verified + pending * 0.5;   // pending worth half
        totalScore  += Math.min(rawScore / 5, 1) * w;
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: rawScore, weight: w, contribution: rawScore * w };
        break;
      }

      // volunteerPrograms => boolean or numeric hours
      case 'volunteerPrograms': {
        let sub = 0;
        if (typeof rawVal === 'boolean') {
          sub = rawVal ? 1 : 0;
        } else if (typeof rawVal === 'number') {
          let hours = clampNonNegative(rawVal);
          if (hours > 1000) hours = 1000; // cap
          sub = hours / 1000;             // 0–1
        }
        totalScore  += sub * w;           // ← apply weight
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: sub, weight: w, contribution: sub * w };
        break;
      }

      // supplierEthics => 0..100 => ratio
      case 'supplierEthics': {
        let sub = 0;
        if (typeof rawVal === 'number') {
          const val = Math.max(0, Math.min(100, rawVal));
          sub = val / 100;
        } else if (typeof rawVal === 'boolean') {
          sub = rawVal ? 1 : 0;
        }
        totalScore  += sub * w;           // ← apply weight
        totalWeight += w;
        explain[key] = { raw: rawVal, normalised: sub, weight: w, contribution: sub * w };
        break;
      }

      default:
        break;
    }
  }

  if (knownCount < 3) {
    return { score: 0, dataStatus: 'INSUFFICIENT_DATA', explanation: explain };
  }
  let dataStatus = knownCount <= 5 ? 'LIMITED_DATA' : 'OK';

  if (totalWeight === 0) {
    return { score: 0, dataStatus: 'INSUFFICIENT_DATA', explanation: explain };
  }

  const final = Math.round((totalScore / totalWeight) * 100);
  return { score: final, dataStatus, explanation: explain };
}

/**
 * Combine average item scores (both products & services) plus user synergy 
 */
export function calculateOverallUserERSScore(
  userItems: DynamicInputs[], // e.g. product + service synergy objects
  userProfile: DynamicInputs  // user synergy
): ScoreResult {
  const itemResults = userItems.map((i) => calculateERSItemScore(i));
  const itemSum     = itemResults.reduce((s, r) => s + r.score, 0);
  const itemCount   = itemResults.length;
  let anyInsufficient = false;
  let limitedCount = 0;

  // average item synergy
  itemResults.forEach((r) => {
      if (r.dataStatus === 'INSUFFICIENT_DATA') anyInsufficient = true;
      else if (r.dataStatus === 'LIMITED_DATA') limitedCount++;
    });
    const avgItemScore = itemCount > 0 ? itemSum / itemCount : 0;

  // user synergy
  const userRes = calculateUserLevelScore({
    chosenMetrics: userProfile.chosenMetrics,
    metrics: userProfile.metrics,
  });
  if (userRes.dataStatus === 'INSUFFICIENT_DATA') {
    anyInsufficient = true;
  } else if (userRes.dataStatus === 'LIMITED_DATA') {
    limitedCount++;
  }

  // Weighted aggregator => half items, half user synergy
  const finalScore = (avgItemScore * 0.5) + (userRes.score * 0.5);

  let dataStatus = 'OK';
  if (anyInsufficient) {
    dataStatus = 'INSUFFICIENT_DATA';
  } else if (limitedCount > 0) {
    dataStatus = 'LIMITED_DATA';
  }

   return {
    score: Math.round(Math.max(0, Math.min(100, finalScore))),
    dataStatus,
    explanation: {},         // ← satisfies ScoreResult shape
  };
}
