/* ------------------------------------------------------------------ */
/*  components/dashboard/ERSMetricsSummary.tsx                        */
/* ------------------------------------------------------------------ */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link  from 'next/link';
import CircularScore from '../ui/circularScore';
import {
  calculateUserLevelScore,   // ← exported earlier
} from '@/services/ersMetricsService';

interface Props { userId: string }

interface UserDoc {
  chosenMetrics: string[];
  metrics: Record<string, any>;
}

/* ---------- tiny helper: readable labels ------------------------- */
const label = (k: string) =>
  k
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());

/* ---------- classify & score individual metrics ------------------ */
type Sub = { key: string; score: number; note: string };

function evaluateMetric(key: string, raw: any, all: Record<string, any>): Sub {
  switch (key) {
    /* ----- paired metrics – need context ------------------------ */
    case 'totalCarbonFootprint': {
      const footprint = raw ?? 0;
      const offsets   = all.carbonOffsets ?? 0;
      const net       = Math.max(0, footprint - offsets);
      const score     = footprint === 0 ? 1 : Math.max(0, 1 - net / footprint);
      const pctOff    = footprint === 0 ? 0 : Math.min(100, (offsets / footprint) * 100);
      return {
        key,
        score,
        note:
          pctOff >= 90
            ? 'Great – most emissions are offset'
            : pctOff >= 50
            ? `Offsets cover ${pctOff.toFixed(0)} %`
            : 'Increase carbon offsets',
      };
    }
    case 'totalEnergyConsumption': {
      const use  = raw ?? 0;
      const prod = all.totalEnergyProduction ?? 0;
      const score =
        use === 0 ? 1 : Math.max(0, 1 - Math.max(0, use - prod) / use);
      return {
        key,
        score,
        note:
          prod >= use
            ? 'Net‑zero energy 👍'
            : `Produces ${(prod / use * 100).toFixed(0)} % of consumption`,
      };
    }

    /* ----- boolean --------------------------------------------- */
    case 'hasSustainabilityPolicy':
    case 'hasVolunteerPrograms': {
      return {
        key,
        score: raw ? 1 : 0,
        note: raw ? 'Achieved ✅' : 'Not yet ❌',
      };
    }

    /* ----- documents array ------------------------------------- */
    case 'uploadedDocuments': {
      const docs      = Array.isArray(raw) ? raw : [];
      const verified  = docs.filter(d => d.verified).length;
      const pending   = docs.filter(d => !d.verified && !d.rejectionReason).length;
      const note =
        verified >= 5  ? `${verified} verified`
      : verified >= 1  ? `${verified} verified · ${pending} pending`
      : pending  >= 1  ? `${pending} pending`
      :                  'No certifications yet';
      const numeric    = Math.min((verified + pending * 0.5) / 5, 1);
      return { key, score: numeric, note };
    }

    /* ----- percentages ----------------------------------------- */
    case 'philanthropicDonations':
    case 'charitableDonationsPercent':
    case 'supplierEthics': {
      const pct = typeof raw === 'number' ? raw : parseFloat(raw);
      const score = Math.max(0, Math.min(100, raw)) / 100;
      return {
        key,
        score,
        note: `${pct}%`,
      };
    }

    /* ----- fallback -------------------------------------------- */
    default:
      return {
        key,
        score: typeof raw === 'boolean' ? (raw ? 1 : 0) : 0.5,
        note: raw?.toString?.() ?? 'N/A',
      };
  }
}

const ERSMetricsSummary: React.FC<Props> = ({ userId }) => {
  /* ---------- state ------------------------------------------- */
  const [doc, setDoc]       = useState<UserDoc | null>(null);
  const [loading, setL]     = useState(true);
  const [err, setErr]       = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/users/${userId}`);
        setDoc({
          chosenMetrics: data.user.chosenMetrics ?? [],
          metrics:       data.user.metrics       ?? {},
        });
      } catch (e) {
        console.error(e);
        setErr('Could not load metrics');
      } finally {
        setL(false);
      }
    };
    load();
  }, [userId]);

  /* ---------- derive scores & notes ---------------------------- */
  const subMetrics: Sub[] = useMemo(() => {
    if (!doc) return [];
    return doc.chosenMetrics.map((k) =>
      evaluateMetric(k, doc.metrics[k], doc.metrics)
    );
  }, [doc]);

  const {
    score: overall,
    dataStatus,
  } = useMemo(
    () => (doc ? calculateUserLevelScore(doc) : { score: 0, dataStatus: '' }),
    [doc]
  );

  if (loading) return <p>Loading…</p>;
  if (err)      return <p className="text-error">{err}</p>;
  if (!doc)     return <p>No metrics yet.</p>;

  /* pick strengths / focus */
  const sorted   = [...subMetrics].sort((a, b) => b.score - a.score);
  const strengths= sorted.filter((m) => m.score >= 0.8).slice(0, 3);
  const focus    = sorted.filter((m) => m.score < 0.5).slice(0, 3);

  return (
    <div className="bg-primary/90 text-white rounded-lg shadow-xl p-8 w-2/3 mx-auto">
      {/* top row ------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex flex-col items-center">
          <CircularScore score={overall} size={120} stroke={14} />
          <p className="mt-1 text-sm opacity-80">
            Data&nbsp;status: <strong>{dataStatus}</strong>
          </p>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4">
          {subMetrics.map((m) => (
            <div key={m.key}>
              <p className="text-xs uppercase tracking-wide mb-1">
                {label(m.key)}
              </p>
              <progress
                className="progress progress-secondary w-full h-2"
                value={Math.round(m.score * 100)}
                max={100}
              />
              <p className="text-[11px] mt-0.5 opacity-80">{m.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* highlights --------------------------------------------- */}
      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-1">Doing great</h3>
          {strengths.length ? (
            strengths.map((m) => (
              <p key={m.key} className="text-xs">✅ {label(m.key)}</p>
            ))
          ) : (
            <p className="text-xs opacity-70">—</p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1">Focus next</h3>
          {focus.length ? (
            focus.map((m) => (
              <p key={m.key} className="text-xs">⚠️ {label(m.key)}</p>
            ))
          ) : (
            <p className="text-xs opacity-70">—</p>
          )}
        </div>
      </div>

      {/* CTA ---------------------------------------------------- */}
      <Link
        href="/dashboard/metrics/ers-extended"
        className="btn btn-secondary w-full mt-8"
      >
        View full insights →
      </Link>
    </div>
  );
};

export default ERSMetricsSummary;
