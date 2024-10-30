// components/NavBar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const NavBar: React.FC = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="navbar fixed top-0 left-0 right-0 bg-base-100 shadow-lg z-50 h-20"
    >
      <div className="flex-1">
        <Link href="/" className="flex items-center">
          <Image
            src="/Main-Logo-Transparent.png"
            alt="Logo"
            width={50}
            height={50}
            className="mr-2"
          />
          <span className="text-xl font-bold">Eco-Source</span>
        </Link>
      </div>
      <div className="flex-none gap-4 flex items-center">
        {/* Switch positions of Blog and Contact Us */}
        <Link href="/blog" className="btn btn-ghost">
          Blog
        </Link>
        <Link
          href="/contact"
          className="btn border border-primary text-primary hover:bg-primary hover:text-white"
        >
          Contact Us
        </Link>
        {/* Add Log In and Sign Up buttons */}
        <Link href="/login" className="btn btn-ghost">
          Log In
        </Link>
        <Link href="/signup" className="btn btn-primary">
          Sign Up
        </Link>
      </div>
    </motion.nav>
  );
};

export default NavBar;
