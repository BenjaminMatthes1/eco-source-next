'use client';
import React, { useEffect, useRef } from 'react';

interface Props {
  /** 0 – 100 */
  score: number;
  /** square size in px (default = 120) */
  size?: number;
  /** ms for the liquid rise (default = 2000) */
  durationMs?: number;
}

/* -------------------- colour interpolation ------------------------ */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpColour(t: number) {
  // red (#dc2626) → yellow (#facc15) → green (#16a34a)
  if (t < 0.5) {
    const p = t * 2; // 0-1 red→yellow
    return rgb(
      lerp(220, 250, p), // R
      lerp(38, 204, p),  // G
      lerp(38, 21, p)    // B
    );
  }
  const p = (t - 0.5) * 2; // 0-1 yellow→green
  return rgb(
    lerp(250, 22, p),
    lerp(204, 163, p),
    lerp(21, 74, p)
  );
}
const rgb = (r: number, g: number, b: number) =>
  `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`;

/* -------------------- leaf silhouette path ----------------------- */
function leafPath(s: number) {
  // a smoother, more pointed leaf
  const w = s, h = s;
  return `
    M ${w * 0.5} 0
    C ${w * 0.88} ${h * 0.18}, ${w * 0.9} ${h * 0.55}, ${w * 0.5} ${h}
    C ${w * 0.1}  ${h * 0.55}, ${w * 0.12} ${h * 0.18}, ${w * 0.5} 0
    Z
  `;
}

export default function LiquidGauge({
  score,
  size = 120,
  durationMs = 2000,
}: Props) {
  const id      = useRef(Math.random().toString(36).slice(2));
  const val     = Math.min(Math.max(score, 0), 100);
  const colour  = lerpColour(val / 100);
  const fillPct = 100 - val;                // 0 (full) → 100 (empty)

  /* wave path taller than view-box so we can slide it up */
  const wavePath = `
    M 0 0
    C ${size * 0.25} -10, ${size * 0.25} 10, ${size * 0.5} 0
    S ${size * 0.75} -10, ${size} 0
    V ${size}
    H 0 Z
  `;

  /* run animation on mount */
  useEffect(() => {
    const wave = document.querySelector<SVGPathElement>(
      `#wave-${id.current}`
    );
    if (wave) {
      wave.style.animation = `rise-${id.current} ${durationMs}ms ease-out forwards`;
    }
  }, [durationMs]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <defs>
        {/* clip exactly to leaf */}
        <clipPath id={`clip-${id.current}`}>
          <path d={leafPath(size)} />
        </clipPath>

        {/* keyframes for wave rise */}
        <style>{`
          @keyframes rise-${id.current} {
            to { transform: translateY(${fillPct}%); }
          }
        `}</style>
      </defs>

      {/* leaf outline only (no fill, no grey shading) */}
      <path d={leafPath(size)} stroke="#e5e7eb" strokeWidth="2" fill="none" />

      {/* coloured liquid wave, clipped to leaf */}
      <g clipPath={`url(#clip-${id.current})`}>
        <path
          id={`wave-${id.current}`}
          d={wavePath}
          fill={colour}
          transform={`translate(0, ${size})`}
        />
      </g>
    </svg>
  );
}
