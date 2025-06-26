import React, { useState } from 'react';
import CircularScore from '@/components/ui/circularScore';
import MetricCard      from '@/components/ui/metricCard';
import { metricLabel } from '@/utils/metricOptions';
import { calculateERSItemScore } from '@/services/ersMetricsService';
import axios from 'axios';
import WhyScoreModal from '@/components/ui/WhyScoreModal';

/* -------------------------------------------------- *
 * 1)  Type‑helpers that match the actual DB shape    *
 * -------------------------------------------------- */

interface PeerRating { userId: string; rating: number }
type RatingArray = PeerRating[];

/* pretty‑print any stored metric */
const fmtMetric = (v: any): string => {
    if (v == null) return '—';
    /* Array of material objects */
    if (Array.isArray(v)) {
      return v
        .map(
          (m: any) =>
            `${m.name} (${m.percentageRecycled}% recycled, renewable = ${m.isRenewable ? 'Yes' : 'No'})`
        )
        .join(', ');
    }
    /* Booleans */
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    /* { value, unit } objects → "10 kg" */
    if (typeof v === 'object' && 'value' in v && 'unit' in v) {
      return `${v.value} ${v.unit}`;
    }
    
/* Plain numbers (e.g. percentage) */
    if (typeof v === 'number') return v.toString();
    return String(v);
    };

/** Turn an array of ratings into {average, count} */
const toStats = (arr: RatingArray) =>
  arr.length
    ? { average: arr.reduce((s, r) => s + r.rating, 0) / arr.length, count: arr.length }
    : { average: 0, count: 0 };

interface Props {
  serviceId:   string;
  isOwner:     boolean;
  chosen:      string[];
  metrics:     Record<string, any>;
  peerRatings: {
    costEffectiveness: RatingArray;
    economicViability: RatingArray;
  };
  userId?: string; // viewer’s id (if logged in)
}

/** prettify {average,count} → "7.4/10 (12)" */
const fmtPeer = (p: { average: number; count: number }) =>
  `${p.average.toFixed(1)}/10 (${p.count})`;


/* ------------------------------------------------------------------- */
const ServiceERSPanel: React.FC<Props> = ({
  serviceId,
  isOwner,
  chosen,
  metrics,
  peerRatings,
  userId,
}) => {
  /* peer‑rating local state */
  const [local, setLocal] = useState({ cost: '', econ: '', error: '' });

  const costStats = toStats(peerRatings.costEffectiveness);
  const econStats = toStats(peerRatings.economicViability);
  const mineCost = peerRatings.costEffectiveness.find(r => r.userId === userId)?.rating ?? null;
  const mineEcon = peerRatings.economicViability.find(r => r.userId === userId)?.rating ?? null;

  const {
    score: ersScore,
    explanation,
  } =
    chosen && metrics
      ? calculateERSItemScore({ chosenMetrics: chosen, metrics })
      : { score: null, explanation: {} as any };

  const [showWhy, setShowWhy] = useState(false);

  /* submit helper */
  async function send(metric: 'costEffectiveness' | 'economicViability') {
    const val = metric === 'costEffectiveness' ? local.cost : local.econ;
    const n   = parseInt(val, 10);
    if (isNaN(n) || n < 1 || n > 10)
      return setLocal({ ...local, error: 'Rating must be 1‑10' });

    try {
      const res = await axios.post(
        `/api/services/${serviceId}/peer-ratings`,
        { metric, rating: n }
      );
      const pr = res.data.service.peerRatings;
      setLocal({ cost: '', econ: '', error: '' });
    } catch {
      setLocal({ ...local, error: 'Could not save rating.' });
    }
  }

  const fmt = (v: any) => {
    if (v == null) return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    /* { value, unit } → "10 kWh" */
    if (typeof v === 'object' && 'value' in v && 'unit' in v) {
      return `${v.value} ${v.unit}`;
    }
    /* percentage‑ish keys come through as plain numbers */
    if (typeof v === 'number') return v % 1 === 0 ? v.toString() : v.toFixed(2);
    return String(v);
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="mt-10 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ---- headline & score ring ---- */}
      {ersScore !== null && (
        <div className="flex flex-col items-center gap-2 bg-neutral p-4 rounded-md">
          <div className="flex items-center gap-2">
            <CircularScore score={ersScore} />
            <button
              onClick={() => setShowWhy(true)}
              className="text-secondary underline text-sm"
            >
              Why?
            </button>
          </div>
          <span className="text-secondary text-xl font-bold">
            Service ERS Score
          </span>
          <WhyScoreModal
            open={showWhy}
            onClose={() => setShowWhy(false)}
            explanation={explanation}
          />
        </div>
      )}

      {/* ---- metrics grid ---- */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* materials first */}
        {chosen.includes('materials') && Array.isArray(metrics.materials) && (
          <MetricCard
            label="Materials"
            value={metrics.materials
                 .map(
                   (m: any) =>
                     `${m.name} (${m.percentageRecycled}% recycled, renewable = ${m.isRenewable ? 'Yes' : 'No'})`
               )
                 .join(', ')}
              />
        )}

        {/* generic metrics */}
        {chosen
          .filter(
            (k) => !['materials', 'costEffectiveness', 'economicViability'].includes(k)
          )
          .map((k) => (
            <MetricCard
              key={k}
              label={metricLabel(k)}
              value={fmtMetric(metrics[k])}
            />
          ))}
      </div>

      {/* ---- peer rating blocks ---- */}
      {['costEffectiveness', 'economicViability'].map((metric) => {
        const mine   = metric === 'costEffectiveness' ? mineCost : mineEcon;
        const peer   = peerRatings[metric as keyof typeof peerRatings];
        const localV = metric === 'costEffectiveness' ? local.cost : local.econ;

        return (
          <div key={metric} className="border rounded p-4 bg-white">
            <h3 className="font-bold mb-2">
              {metric === 'costEffectiveness'
                ? 'Cost Effectiveness'
                : 'Economic Viability'}
            </h3>

            {isOwner ? (
              <p>Peer average: {fmtPeer(costStats)}</p>
            ) : mine ? (
              <>
                <p>Your rating: {mine}/10</p>
                <p>Overall average: {fmtPeer(econStats)}</p>
              </>
            ) : (
              <>
                <label className="text-sm block mb-1">Rate (1–10):</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={localV}
                  onChange={(e) =>
                    metric === 'costEffectiveness'
                      ? setLocal({ ...local, cost: e.target.value })
                      : setLocal({ ...local, econ: e.target.value })
                  }
                  className="border p-1 w-20 mr-2"
                />
                <button
                  onClick={() =>
                    send(metric as 'costEffectiveness' | 'economicViability')
                  }
                  className="btn btn-sm btn-secondary"
                >
                  Submit
                </button>
              </>
            )}

            {local.error && <p className="text-red-500">{local.error}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default ServiceERSPanel;
