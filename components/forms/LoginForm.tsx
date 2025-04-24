// components/forms/LoginForm.tsx


'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/layout/NavBar';
import Image from 'next/image';
import Link from 'next/link';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Form state from the second component
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      // Fetch user session to check role
      const res = await fetch('/api/auth/session');
      const { user } = await res.json();

      if (user.role === 'admin') {
        router.push('/dashboard/admin/verify-documents'); // Redirect admins
      } else {
        router.push('/dashboard'); // Redirect regular users
      }
    }
  };

  return (
    <>
      <div className="relative min-h-screen flex flex-col w-full">
        {/* Background Image */}
        <div className="absolute inset-0 w-full">
          <Image
            src="/images/abstract-4.jpg"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(255, 255, 255, .7), rgba(255, 255, 255, 0) 60%)',
            }}
          ></div>
        </div>
        {/* Content */}
        <div className="relative flex flex-1">
          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="bg-primary bg-opacity-90 text-white p-8 rounded-lg shadow-lg m-4 w-1/2 ">
              <h1 className="text-4xl font-bold mb-8 text-center">Welcome Back!</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-m font-medium text-white">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full text-white bg-transparent border-b border-white focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-m font-medium text-base-100">
                    Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 block w-full text-white bg-transparent border-b border-white focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeIcon className="h-5 w-5 text-white" />
                      ) : (
                        <EyeOffIcon className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && <p className="text-error text-sm">{error}</p>}

                {/* Submit Button */}
                <button type="submit" className="btn btn-secondary w-full mt-4 text-white">
                  Log In
                </button>

                {/* Sign Up Link */}
                <Link href="/signup" className="btn btn-ghost w-full mt-4 text-white hover:bg-transparent hover:text-secondary">
                  Not a Member? Sign Up Now
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
