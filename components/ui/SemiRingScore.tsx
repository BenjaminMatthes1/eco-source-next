'use client';
import React, { useId } from 'react';

interface Props {
  score: number;      // 0 – 100
  size?: number;      // svg box size (px)
  stroke?: number;    // stroke width (px)
}

/* ------------------------------------------------------------------ */
/*  geometry helpers                                                  */
/* ------------------------------------------------------------------ */
const deg2rad = (d: number) => (Math.PI * d) / 180;
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = deg2rad(deg);
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  const start = polar(cx, cy, r, endDeg);
  const end   = polar(cx, cy, r, startDeg);
  return `M${start.x},${start.y} A${r},${r} 0 ${large} 0 ${end.x},${end.y}`;
}

/* ------------------------------------------------------------------ */
/*  component                                                         */
/* ------------------------------------------------------------------ */
export default function SemiRingScore({ score, size = 72, stroke = 10 }: Props) {
  const id      = useId();                               // unique <defs> id
  const val     = Math.min(Math.max(score, 0), 100);
  const radius  = (size - stroke) / 2;
  const cx      = size / 2;
  const cy      = size / 2 + stroke / 2;
  const fullLen = Math.PI * radius;                      // half-circumference
  const len     = (val / 100) * fullLen;                 // coloured length

  /* path for one 60° segment with a 2° gap */
  const seg = (i: number) => {
    const start = 180 - i * 60;          // 180, 120, 60
    const end   = start - 60 + 2;        // leave 2° gap on right side
    return describeArc(cx, cy, radius, start, end);
  };

  return (
    <svg width={size} height={size / 2}>
      {/* gradient that always spans entire semicircle */}
      <defs>
        <linearGradient
          id={`grad-${id}`}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={cy}
          x2={size}
          y2={cy}
        >
          <stop offset="0%"   stopColor="#dc2626" /> {/* red */}
          <stop offset="40%"  stopColor="#f97316" /> {/* orange */}
          <stop offset="70%"  stopColor="#facc15" /> {/* yellow */}
          <stop offset="100%" stopColor="#16a34a" /> {/* green */}
        </linearGradient>
      </defs>

      {/* background grey segments */}
      {[0, 1, 2].map((i) => (
        <path
          key={`bg-${i}`}
          d={seg(i)}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
      ))}

      {/* coloured overlay clipped to score */}
      <path
        d={[0, 1, 2].map(seg).join(' ')}          // three segments as one path
        stroke={`url(#grad-${id})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${len} ${fullLen - len}`}
        fill="none"
      />
    </svg>
  );
}
