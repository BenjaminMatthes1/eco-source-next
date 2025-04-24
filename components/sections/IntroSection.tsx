// components/IntroSection.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const IntroSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="hero min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url('images/HomePage-Main.png')` }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content z-10">
        <div className="max-w-md bg-base-100 bg-opacity-90 p-8 rounded-lg shadow-xl">
          <h1 className="mb-5 text-5xl text-primary">
            EMPOWER, CONNECT, SUSTAIN.
          </h1>
          <p className="mb-5 text-md text-primary">
            <strong>Connect with suppliers and buyers of eco-friendly materials to ensure a sustainable future.</strong>
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="btn btn-primary text-white hover:bg-secondary">
              Sign Up
            </Link>
            <Link href="/login" className="btn btn-secondary hover:bg-primary text-white">
              Member Login
            </Link>
          </div>
          <p className="mt-5 text-sm text-black">
            *Cancel or pause for free at any time you want*
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default IntroSection;
