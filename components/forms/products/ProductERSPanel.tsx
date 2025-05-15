'use client';

import React, { useState } from 'react';
import CircularScore   from '@/components/ui/circularScore';
import MetricCard      from '@/components/ui/metricCard';
import { metricLabel } from '@/utils/metricOptions';
import { calculateERSItemScore } from '@/services/ersMetricsService';
import axios from 'axios';

/* ----- helpers ------------------------------------ */
interface PeerRating { userId: string; rating: number }
type RatingArray = PeerRating[];
const toStats = (arr: RatingArray) =>
  arr.length
    ? { average: arr.reduce((s, r) => s + r.rating, 0) / arr.length, count: arr.length }
    : { average: 0, count: 0 };

const fmtPeer = (p: { average: number; count: number }) =>
  `${p.average.toFixed(1)}/10 (${p.count})`;

const fmtMetric = (v: any): string => {
  if (v == null) return '—';
  if (Array.isArray(v)) {
    return v
      .map(
        (m: any) =>
          `${m.name} (${m.percentageRecycled}% recycled, renewable = ${m.isRenewable ? 'Yes' : 'No'})`
      )
      .join(', ');
  }
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object' && 'value' in v && 'unit' in v) {
    return `${v.value} ${v.unit}`;
  }
  if (typeof v === 'number') return v.toString();
  return String(v);
};

/* ----- component props ----------------------------- */
interface Props {
  productId:   string;
  isOwner:     boolean;
  chosen:      string[];
  metrics:     Record<string, any>;
  peerRatings: {
    costEffectiveness: RatingArray;
    economicViability: RatingArray;
  };
  userId?: string;
}

/* ----- component ----------------------------------- */
const ProductERSPanel: React.FC<Props> = ({
  productId,
  isOwner,
  chosen,
  metrics,
  peerRatings,
  userId,
}) => {
  /* averages & personal ratings -------------------- */
  const costStats = toStats(peerRatings.costEffectiveness);
  const econStats = toStats(peerRatings.economicViability);
  const mineCost  = peerRatings.costEffectiveness.find(r => r.userId === userId)?.rating ?? null;
  const mineEcon  = peerRatings.economicViability.find(r => r.userId === userId)?.rating ?? null;

  /* local form state */
  const [local, setLocal] = useState({ cost: '', econ: '', error: '' });

  const ersScore =
    chosen && metrics
      ? calculateERSItemScore({ chosenMetrics: chosen, metrics }).score
      : null;

  async function submit(metric: 'costEffectiveness' | 'economicViability') {
    const val = metric === 'costEffectiveness' ? local.cost : local.econ;
    const n   = parseInt(val, 10);
    if (isNaN(n) || n < 1 || n > 10)
      return setLocal({ ...local, error: 'Rating must be 1‑10' });
    try {
      await axios.post(`/api/products/${productId}/peer-ratings`, {
        metric,
        rating: n,
      });
      window.location.reload(); // quick refresh keeps code small
    } catch {
      setLocal({ ...local, error: 'Could not save rating.' });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* score ring */}
      {ersScore !== null && (
        <div className="flex flex-col items-center gap-2 bg-neutral p-4 rounded-md">
          <CircularScore score={ersScore} />
          <span className="text-secondary text-xl font-bold">Product ERS Score</span>
        </div>
      )}

      {/* metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        {chosen.map((k) => (
          k === 'materials' ? (
            <MetricCard
              key="materials"
              label="Materials"
              value={fmtMetric(metrics.materials)}
            />
          ) : !['costEffectiveness','economicViability'].includes(k) ? (
            <MetricCard
              key={k}
              label={metricLabel(k)}
              value={fmtMetric(metrics[k])}
            />
          ) : null
        ))}
      </div>

      {/* peer rating blocks */}
      {['costEffectiveness','economicViability'].map((metric) => {
        const mine   = metric === 'costEffectiveness' ? mineCost : mineEcon;
        const stats  = metric === 'costEffectiveness' ? costStats : econStats;
        const inputV = metric === 'costEffectiveness' ? local.cost : local.econ;
        return (
          <div key={metric} className="border rounded p-4 bg-white">
            <h3 className="font-bold mb-2">
              {metric === 'costEffectiveness'
                ? 'Cost Effectiveness'
                : 'Economic Viability'}
            </h3>
            {isOwner ? (
              <p>Peer average: {fmtPeer(stats)}</p>
            ) : mine ? (
              <>
                <p>Your rating: {mine}/10</p>
                <p>Overall average: {fmtPeer(stats)}</p>
              </>
            ) : (
              <>
                <label className="text-sm block mb-1">Rate (1–10):</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={inputV}
                  onChange={(e) =>
                    metric === 'costEffectiveness'
                      ? setLocal({ ...local, cost: e.target.value })
                      : setLocal({ ...local, econ: e.target.value })
                  }
                  className="border p-1 w-20 mr-2"
                />
                <button
                  onClick={() => submit(metric as any)}
                  className="btn btn-sm btn-secondary"
                >
                  Submit
                </button>
                {local.error && <p className="text-red-500">{local.error}</p>}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductERSPanel;
