// NEW FILE
'use client';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function Collapsible({ title, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const [height, setH]  = useState(0);

  useEffect(() => {
    if (ref.current) setH(ref.current.scrollHeight);
  }, [children]);

  return (
    <div className="bg-neutral rounded-lg shadow-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h2 className="text-2xl font-semibold">{title}</h2>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {/* animated container */}
      <div
        style={{ maxHeight: open ? height : 0 }}
        className="overflow-hidden transition-all duration-[700ms] ease-in-out"
      >
        <div ref={ref} className="p-4">{children}</div>
      </div>
    </div>
  );
}
