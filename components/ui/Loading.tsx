'use client';

export default function Loading({ size = 56 }: { size?: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/60">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="animate-spin text-secondary"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-25"
          fill="none"
        />
        <path
          d="M22 12a10 10 0 0 0-10-10"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-75"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
