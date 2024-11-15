// app/login/page.tsx
'use client'
import LoginForm from '@/components/forms/LoginForm'

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Log In</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
