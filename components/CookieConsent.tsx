'use client';

import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [show, setShow]   = useState(false);

  useEffect(() => {
    // consent stored in localStorage; skip banner if already given
    if (!localStorage.getItem('eco_consent')) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem('eco_consent', 'yes');
    setShow(false);
  }

  function decline() {
    localStorage.setItem('eco_consent', 'no');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 bg-neutral rounded-lg shadow-lg p-4 text-primary z-50">
      <p className="mb-3 text-sm">
        Eco-Source uses essential cookies for secure login and site analytics.
        You can choose to accept or decline non-essential cookies.
      </p>
      <div className="flex gap-3 justify-end">
        <button className="btn btn-sm btn-outline" onClick={decline}>
          Decline
        </button>
        <button className="btn btn-sm btn-primary" onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  );
}
