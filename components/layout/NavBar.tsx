// components/layout/NavBar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

const NavBar: React.FC = () => {
  const { data: session, status } = useSession();


  if (status === 'loading') {
    return (
      <motion.nav
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="navbar fixed top-0 left-0 right-0 bg-base-100 shadow-lg z-50 h-20"
      >
        <div className="navbar bg-white h-16">
          <div className="flex-1">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/Logo_Primary_Transparent.png"
                alt="Logo"
                width={50}
                height={50}
                className="mr-2"
              />
              <span className="text-xl font-bold">Eco-Source</span>
            </Link>
          </div>
        </div>
      </motion.nav>
    );
  }


  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="navbar fixed top-0 left-0 right-0 bg-base-100 shadow-lg z-50 h-20"
    >
      <nav className="navbar bg-white ">
        
        <div className="flex-1">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/Logo_Primary_Transparent.png"
              alt="Logo"
              width={50}
              height={50}
              className="mr-2"
            />
            <span className="text-xl font-bold">Eco-Source</span>
          </Link>
        </div>
        <div className="flex-none gap-2">
          <Link href="/blog" className="btn btn-ghost">
            Blog
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost">
                Dashboard
              </Link>
              {session.user.role === 'admin' && (
                <Link href="/dashboard/admin/verify-documents" className="btn btn-secondary">
                  Admin Dashboard
                </Link>
              )}
              <button onClick={() => signOut()} className="btn btn-ghost">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Log In
              </Link>
              <Link href="/signup" className="btn btn-ghost">
                Sign Up
              </Link>
            </>
          )}
          <Link
            href="/contact"
            className="btn btn-primary hover:bg-neutral hover:text-primary"
          >
            Contact Us
          </Link>
        </div>
      </nav>
      
    </motion.nav>
  );
};

export default NavBar;
