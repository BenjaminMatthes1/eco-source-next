// components/ui/CircularScore.tsx
import React, { memo, useMemo } from 'react';

export interface CircularScoreProps {
  /** Score from 0 – 100 */
  score: number;
  /** Diameter of the SVG in px (default = 80) */
  size?: number;
  /** Thickness of the ring (default = 10) */
  stroke?: number;
}

/** Convert a 0-100 score to a 0-120 hue (red ➜ green) */
const scoreToHue = (val: number) => {
  const clamped = Math.max(0, Math.min(100, val));
  return (clamped * 120) / 100;
};

/** Re-usable circular progress badge */
const CircularScore: React.FC<CircularScoreProps> = ({
  score,
  size = 100,
  stroke = 10,
}) => {
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;

  /* animate from 0 ➜ score */
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    let start: number | null = null;
    const duration = 2000; // ms

    const step = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setProgress(pct * score);
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  const offset = circ - (progress / 100) * circ;
  const hue    = (progress * 120) / 100;
  const color  = `hsl(${hue},100%,45%)`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="select-none"
      role="img"
      aria-label={`ERS score ${score} percent`}
    >
      {/* bg ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      {/* animated ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke .5s linear' }}
      />
      {/* value */}
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fontSize={size * 0.25}
        fontFamily="HelveticaNowtext-Thin, sans-serif"
        fontWeight={700}
        fill={color}
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

export default memo(CircularScore);
