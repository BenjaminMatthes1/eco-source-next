// app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/layout/NavBar';
import Image from 'next/image';
import Link from 'next/link';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/dashboard');
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <NavBar />
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/abstract-2.jpg"
            alt="Background"
            layout="fill"
            objectFit="cover"
            priority
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, .7), rgba(255, 255, 255, 0) 60%)',
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-1">
          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="bg-primary bg-opacity-90 text-white p-8 rounded-lg shadow-lg m-4 w-full max-w-md">
              <h1 className="text-4xl font-bold mb-8 text-center">Welcome Back!</h1>
              <form onSubmit={handleSubmit}>
                {/* Include your form fields here */}
                {/* Email */}
                <label className="block mb-4">
                <span className="text-base-100">Email:</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered input-secondary w-full text-black"
                  required
                />
                </label>

                {/* Password */}
                <label className="block mb-4">
                  <span className="text-white">Password:</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input input-bordered input-secondary w-full pr-12 text-black"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </label>
                {/* Error Message */}
                {error && <p className="text-error mb-4">{error}</p>}

                {/* Submit Button */}
                <button type="submit" className="btn btn-secondary w-full mt-4">
                Log In
                </button>
                <Link href="/signup" className="btn btn-ghost w-full mt-4t mt-2 text-white">
                  Not a Member? Sign Up Now
                </Link>
              </form>
            </div>
          </div>

          {/* Right Side - What's New */}
          <div className="w-1/2 hidden md:flex items-center justify-center">
            <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg m-4 max-w-md">
              <h2 className="text-3xl font-bold mb-4 text-primary">What's New at Eco-Source</h2>
              <ul className="list-disc list-inside mb-4 text-primary">
                <li>
                  <strong>New Article:</strong> "10 Ways to Reduce Your Carbon Footprint"
                </li>
                <li>
                  <strong>Event:</strong> Virtual Workshop on Sustainable Living - August 25th
                </li>
                <li>
                  <strong>Feature Update:</strong> Personalized Eco-Friendly Recommendations
                </li>
                <li>
                  <strong>Community Highlight:</strong> Interview with Eco-Innovators
                </li>
              </ul>
              <p className="mb-4 text-primary">
                Log in now to explore these updates and continue your journey towards a greener future
                with us!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

