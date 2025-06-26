// --- utils/reviewCredibility.ts (new) ---
/**
 * Converts peer-rating data to a 0-1 score with credibility weighting.
 *
 * Accepts either:
 *  • { average: 7.2, count: 18 }
 *  • [{ rating: 8, createdAt, userId }, …]  (falls back to compute avg / count)
 */
export function peerRatingScore(raw: any): number {
  let avg = 0;
  let count = 0;

  if (Array.isArray(raw)) {
    count = raw.length;
    if (!count) return 0;
    avg = raw.reduce((s, r) => s + (r?.rating ?? 0), 0) / count;
  } else if (raw && typeof raw.average === 'number' && typeof raw.count === 'number') {
    avg = raw.average;
    count = raw.count;
  } else {
    return 0; // malformed
  }

  /* -------------- credibility factor -----------------
     • < 2 reviews:   ×0.2 (heavily discounted)
     • 2-10 reviews:  grows log10-style, reaches 1 at 10
     • >10 reviews:   cap at 1
  */
  const credibility = Math.min(Math.log10(count + 1) / 1, 1);

  /* final 0-1 */
  return (Math.min(avg, 10) / 10) * credibility;
}
