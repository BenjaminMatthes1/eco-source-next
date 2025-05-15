'use client';
import { useEffect, useState } from 'react';

export default function ThemeSwitch() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <label className="swap swap-rotate">
      <input type="checkbox" checked={dark} onChange={() => setDark(!dark)} />
      <svg className="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M5.64 17..."/> {/* moon */}
      </svg>
      <svg className="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 2..."/> {/* sun */}
      </svg>
    </label>
  );
}
