'use client';

import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import React, { useState } from 'react'; 

export interface StarsDisplayProps {
  value: number;            // 0 .. 5 in 0.5 steps
  size?: number;            // icon px, default 18
  className?: string;
}

/* ---------- read‑only stars (for existing reviews) ---------- */
export const StarsDisplay: React.FC<StarsDisplayProps> = ({
  value,
  size = 18,
  className = '',
}) => {
  const full  = Math.floor(value);
  const half  = value % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[...Array(full)].map((_, i) => (
        <FaStar key={`f${i}`} size={size} className="text-amber-400" />
      ))}
      {half === 1 && <FaStarHalfAlt size={size} className="text-amber-400" />}
      {[...Array(empty)].map((_, i) => (
        <FaRegStar key={`e${i}`} size={size} className="text-amber-400" />
      ))}
    </span>
  );
};

/* ---------- interactive input (for new review) -------------- */
interface StarsInputProps {
  value: number;                      // 0 .. 5 (initial)
  onChange: (val: number) => void;
  size?: number;
}

export const StarsInput: React.FC<StarsInputProps> = ({
  value,
  onChange,
  size = 26,
}) => {
    const [hover, setHover] = useState<number | null>(null);

  const starVal = (idx: number, half: boolean) => half ? idx + 0.5 : idx + 1;

  return (
    <div className="inline-flex select-none">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="relative">
          {/* left half */}
          <div
            className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
            onMouseEnter={() => setHover(starVal(i, true))}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(starVal(i, true))}
          />
          {/* right half */}
          <div
            className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
            onMouseEnter={() => setHover(starVal(i, false))}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(starVal(i, false))}
          />

          {/* icon decide */}
          {(() => {
            const display = hover ?? value;
            if (display >= i + 1)        return <FaStar        size={size} className="text-secondary" />;
            if (display >= i + 0.5)      return <FaStarHalfAlt size={size} className="text-secondary" />;
            return <FaRegStar            size={size} className="text-primary" />;
          })()}
        </div>
      ))}
    </div>
  );
};
