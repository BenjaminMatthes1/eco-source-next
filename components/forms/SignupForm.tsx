'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';
import { signIn } from 'next-auth/react';

const SignupForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // The new user’s form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    interests: '',
    location: '',
    subscribeNewsletter: false,
    companyName: '',
    website: '',
    businessSize: 'small',
  });

  // Toggle password visibility
  const handleShowPassword = () => setShowPassword(!showPassword);

  // Capture changes from text, select, checkbox
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // 1) Create user via /api/auth/signup
  // 2) If success, sign them in => signIn('credentials')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // A) Attempt to create the user
      const response = await axios.post('/api/auth/signup', formData);
      if (response.status !== 201) {
        // If we didn't get a 201, throw the error
        throw new Error(response.data?.message || 'Signup failed');
      }

      // B) On success, auto-signin using NextAuth credentials provider
      const signInRes = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, // so we can control where to go next
      });

      if (signInRes?.error) {
        // SignIn can fail if password mismatch, but here it should succeed
        throw new Error(signInRes.error);
      }

      // C) If signIn is successful, redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/abstract-5.jpg"
          alt="Background"
          fill
          className="object-cover"
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

      <div className="relative flex flex-1">
        {/* Left Side - Sign-Up Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="bg-primary bg-opacity-90 text-white p-8 rounded-lg shadow-lg m-4 w-full max-w-md">
            <h1 className="text-4xl font-bold mb-8 text-center">Create Your Account</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Your Name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password + Show/Hide */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-white"
                  onClick={handleShowPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-white" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-white">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                >
                  <option value="" disabled>Select your role</option>
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                </select>
              </div>

              {/* Business Size */}
              <label htmlFor="businessSize" className="block text-sm font-medium text-white">
                Business Size
              </label>
              <select
                id="businessSize"
                name="businessSize"
                value={formData.businessSize}
                onChange={handleChange}
                className="mt-1 block w-full text-white bg-transparent border-b border-white
                          focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
              >
                <option value="micro">Micro (&lt; 10 employees)</option>
                <option value="small">Small (10–49)</option>
                <option value="medium">Medium (50–249)</option>
                <option value="large">Large (250+)</option>
              </select>

              {/* Interests */}
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-white">
                  Interests (comma-separated)
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="e.g., renewable energy, recycled materials"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-white">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Your Location"
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-white">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Your Company Name"
                />
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-white">
                  Company Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>

              {/* Subscribe Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="subscribeNewsletter"
                  name="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-white">
                  Subscribe to our newsletter
                </label>
              </div>

              {/* Error Display */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Submit */}
              <button type="submit" className="btn btn-secondary w-full">
                Sign Up
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Additional Info */}
        <div className="w-1/2 hidden md:flex items-center justify-center">
          <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg m-4 max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-primary">Join Eco-Source Today!</h2>
            <p className="mb-4 text-primary">
              At Eco-Source, we're committed to connecting you with the best eco-friendly resources
              and communities. By joining us, you gain access to:
            </p>
            <ul className="list-disc list-inside mb-4 text-primary">
              <li>Exclusive content on sustainable living</li>
              <li>Networking with like-minded individuals</li>
              <li>Latest updates on eco-friendly innovations</li>
              <li>Personalized recommendations based on your interests</li>
            </ul>
            <p className="mb-4 text-primary">
              Together, we can make a difference and contribute to a more sustainable future.
            </p>
            <h3 className="text-2xl font-bold text-primary">Be the Change. Join Us Now!</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
