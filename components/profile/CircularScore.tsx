// If you need a standalone component:
'use client';
import React from 'react';

/** 
 * Convert a 0..100 score to an HSL hue (0=red..120=green).
 */
function getScoreHue(score: number) {
  const clamped = Math.max(0, Math.min(100, score));
  return (clamped * 120) / 100;
}

/** 
 * Renders a circular progress ring with the numeric score in the center.
 */
const CircularScore: React.FC<{ score: number }> = ({ score }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const hue = getScoreHue(score);
  const strokeColor = `hsl(${hue}, 100%, 50%)`;

  return (
    <svg className="w-24 h-24" viewBox="0 0 100 100">
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#e5e7eb" 
        strokeWidth="10"
      />
      {/* Progress circle */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      {/* Score text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy=".3em"
        fontSize="16"
        fontWeight="bold"
        fill={strokeColor}
      >
        {score}%
      </text>
    </svg>
  );
};

export default CircularScore;
