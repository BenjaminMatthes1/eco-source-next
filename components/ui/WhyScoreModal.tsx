// --- components/ui/WhyScoreModal.tsx (replace all) ---
'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';

/* ---------- types ----------- */
interface MetricExplainer {
  raw: any;
  normalised: number;
  weight: number;
  contribution: number;
}
type Explanation = Record<string, MetricExplainer>;

interface Props {
  open: boolean;
  onClose: () => void;
  explanation?: Explanation;
  title?: string;
}

/* ---------- helpers ---------- */
function prettyRaw(v: any): string {
  if (v == null) return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object') {
    if ('value' in v && 'unit' in v) return `${v.value} ${v.unit}`;
    return Array.isArray(v) ? JSON.stringify(v) : JSON.stringify(v, null, 0);
  }
  return String(v);
}

/* ---------- component -------- */
export default function WhyScoreModal({
  open,
  onClose,
  explanation = {},
  title = 'Why this score?',
}: Props) {
  const rows = Object.entries(explanation ?? {});

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />

      {/* panel */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 z-10">
        <Dialog.Title className="text-xl font-bold text-primary">{title}</Dialog.Title>

        <div className="max-h-96 overflow-y-auto">
          {rows.length ? (
            rows.map(([k, ex]) => (
              <div key={k} className="mb-4 border-b pb-2">
                <p className="font-semibold capitalize">{k}</p>
                <p className="text-sm text-gray-600">
                  Raw:&nbsp;<span className="font-mono break-all">{prettyRaw(ex.raw)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Normalised:&nbsp;{(ex.normalised * 100).toFixed(1)} %
                  &nbsp;· Weight:&nbsp;{ex.weight.toFixed(2)}
                  &nbsp;· Contribution:&nbsp;{(ex.contribution * 100).toFixed(1)} %
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">
              No metric breakdown available for this item yet.
            </p>
          )}
        </div>

        <button onClick={onClose} className="btn btn-secondary w-full">
          Close
        </button>
      </div>
    </Dialog>
  );
}
