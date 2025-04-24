// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import NavBar from "@/components/layout/NavBar"
import Image from 'next/image';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

const SignUp: React.FC = () => {
  // Existing state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // New state variables
  const [role, setRole] = useState('individual'); // Default value
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  // const [profilePicture, setProfilePicture] = useState<File | null>(null); // For file upload

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('/api/auth/signup', {
        email,
        password,
        name,
        role,
        interests,
        location,
        subscribeNewsletter,
        companyName,
        website,
        // profilePicture, // Handle file uploads separately
      });
      router.push('/login');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || 'An error occurred';
        setError(message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <>
      <NavBar />
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/abstract-1.jpg"
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
          {/* Left Side - Sign-Up Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="bg-primary bg-opacity-90 text-white p-8 rounded-lg shadow-lg m-4 w-full max-w-md ">
              <h1 className="text-4xl font-bold mb-8 text-center">
                Create Your Account
              </h1>
              <form onSubmit={handleSubmit}>
                {/* Include your form fields here */}
                {/* ... form fields ... */}
                <form onSubmit={handleSubmit} className="max-w-md mx-auto ">
                {error && <p className="text-error mb-4">{error}</p>}

                {/* Name */}
                <label className="block mb-4">
                  Name:
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered input-secondary w-full text-black"
                    required
                  />
                </label>

                {/* Email */}
                <label className="block mb-4">
                  Email:
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

                {/* Role */}
                <label className="block mb-4">
                  Role:
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="select select-bordered input-secondary w-full text-black"
                    required
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                    <option value="organization">Organization</option>
                  </select>
                </label>

                {/* Company Name (Conditional) */}
                {role !== 'individual' && (
                  <label className="block mb-4">
                    Company/Organization Name:
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input input-bordered input-secondary w-ful text-black"
                    />
                  </label>
                )}

                {/* Website */}
                {role !== 'individual' && (
                  <label className="block mb-4">
                    Website:
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="input input-bordered input-secondary w-full text-black"
                    />
                  </label>
                )}

                {/* Interests */}
                <label className="block mb-4">
                  Interests:
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Renewable Energy', 'Recycling', 'Conservation', 'Sustainable Living'].map(
                      (interest) => (
                        <label key={interest} className="flex items-center">
                          <input
                            type="checkbox"
                            value={interest}
                            checked={interests.includes(interest)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInterests([...interests, interest]);
                              } else {
                                setInterests(interests.filter((i) => i !== interest));
                              }
                            }}
                            className="checkbox checkbox-secondary mr-2"
                          />
                          {interest}
                        </label>
                      )
                    )}
                  </div>
                </label>

                {/* Location */}
                <label className="block mb-4">
                  Location:
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input input-bordered input-secondary w-full text-black"
                  />
                </label>

                {/* Newsletter Subscription */}
                <label className="block mb-4">
                  <input
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="checkbox checkbox-secondary mr-2"
                  />
                  Subscribe to our newsletter
                </label>

                {/* Profile Picture (Optional) */}
                {/* <label className="block mb-4">
                  Profile Picture:
                  <input
                    type="file"
                    onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                    className="file-input file-input-bordered w-full"
                  />
                </label> */}

                
                
              </form>
              <button type="submit" className="btn btn-secondary w-full text-white">
                  Sign Up
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Persuasive Content */}
          <div className="w-1/2 hidden md:flex items-center justify-center">
            <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg m-4 max-w-md">
              <h2 className="text-3xl font-bold mb-4 text-primary">Join Eco-Source Today!</h2>
              <p className="mb-4 text-primary">
                At Eco-Source, we're committed to connecting you with the best eco-friendly resources
                and communities. By joining us, you gain access to:
              </p>
              <ul className="list-disc list-inside mb-4 text-primary">
                <li>Exclusive content on sustainable living</li>
                <li>Networking opportunities with like-minded individuals</li>
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
    </>
  );
};

export default SignUp;


