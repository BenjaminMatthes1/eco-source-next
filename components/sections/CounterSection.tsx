// components/CounterSection.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FaUsers, FaLeaf, FaExchangeAlt, FaCloud } from 'react-icons/fa';

const CounterSection: React.FC = () => {
  const [counters, setCounters] = useState({
    members: 0,
    co2Saved: 0,
    transactions: 0,
    productsExchanged: 0,
  });

  const counterSectionRef = useRef<HTMLDivElement>(null);
  const hasCounted = useRef(false);

  useEffect(() => {
    const handleCounting = () => {
      const duration = 3000;

      const incrementCounters = (start: number, end: number, key: keyof typeof counters) => {
        let current = start;
        const stepTime = Math.abs(Math.floor(duration / (end - start)));
        const timer = setInterval(() => {
          current += 1;
          setCounters((prevState) => ({ ...prevState, [key]: current }));
          if (current >= end) {
            clearInterval(timer);
          }
        }, stepTime);
      };

      incrementCounters(0, 50, 'members');
      incrementCounters(0, 5, 'co2Saved');
      incrementCounters(0, 125, 'transactions');
      incrementCounters(0, 500, 'productsExchanged');
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasCounted.current) {
          handleCounting();
          hasCounted.current = true;
        }
      },
      { threshold: 0.3 }
    );

    if (counterSectionRef.current) {
      observer.observe(counterSectionRef.current);
    }

    return () => {
      if (counterSectionRef.current) {
        observer.unobserve(counterSectionRef.current);
      }
    };
  }, []);

  return (
    <section className="text-center bg-base-000 py-12">
      <h2 className="text-4xl font-bold mb-8">Our Impact</h2>
      <div
        ref={counterSectionRef}
        className="container mx-auto flex flex-row justify-center items-center gap-8"
      >
        <div className="stat place-items-center">
          <FaUsers className="text-5xl mb-2" />
          <div className="stat-value">{counters.members}+</div>
          <div className="stat-desc text-2xl">Members</div>
        </div>
        <div className="stat place-items-center">
          <FaCloud className="text-5xl mb-2" />
          <div className="stat-value">{counters.co2Saved} Tons</div>
          <div className="stat-desc text-2xl">CO2 Saved</div>
        </div>
        <div className="stat place-items-center">
          <FaExchangeAlt className="text-5xl mb-2" />
          <div className="stat-value">{counters.transactions}</div>
          <div className="stat-desc text-2xl">Transactions</div>
        </div>
        <div className="stat place-items-center">
          <FaLeaf className="text-5xl mb-2" />
          <div className="stat-value">{counters.productsExchanged}</div>
          <div className="stat-desc text-2xl">Products Exchanged</div>
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
