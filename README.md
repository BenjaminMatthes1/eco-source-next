# Eco-Source

Eco-Source is a platform dedicated to connecting buyers and suppliers of eco-friendly, sustainable materials. Users can create profiles, engage in conversations, participate in forums, and manage their preferences. The project is built with Next.js, TypeScript, MongoDB, and Tailwind CSS.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [License](#license)

## Features
- User authentication and authorization with NextAuth.
- User profiles, including company or individual roles.
- Subscription-based access control.
- Messaging, forum threads, and posts.
- Activity logging and customizable notification preferences.
- Responsive and modern UI with Tailwind CSS.

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, MongoDB, Mongoose
- **Authentication:** NextAuth.js
- **Icons & Styling:** DaisyUI, react-icons

## Project Structure
```plaintext
eco-source-next/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── components/         # UI components
│   ├── forms/              # Form components (Login, Signup)
│   ├── layout/             # Header, Footer, Navbar
│   ├── sections/           # Page sections
│   ├── globals.css         # Global CSS
│   └── providers.tsx       # Context providers
├── lib/                    # Utility and configuration files
├── models/                 # Mongoose models for MongoDB
├── public/                 # Static assets
├── services/               # Service functions (e.g., forum, message)
├── utils/                  # Utility functions
├── .env.local.example      # Example environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
