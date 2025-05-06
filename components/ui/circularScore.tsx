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
  size = 80,
  stroke = 10,
}) => {
  const radius   = (size - stroke) / 2;      // keep stroke inside viewBox
  const circ     = 2 * Math.PI * radius;
  const { offset, color } = useMemo(() => {
    const off = circ - (score / 100) * circ;
    const hue = scoreToHue(score);
    return { offset: off, color: `hsl(${hue},100%,50%)` };
  }, [score, circ]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="select-none"
      role="img"
      aria-label={`ERS score ${score} percent`}
    >
      {/* background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="white"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />

      {/* progress ring */}
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
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />

      {/* score text */}
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fontSize={size * 0.32}
        fontFamily="redditLight, sans-serif"
        fontWeight={700}
        fill={color}
      >
        {score}%
      </text>
    </svg>
  );
};

export default memo(CircularScore);
