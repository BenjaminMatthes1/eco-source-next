// app/signup/page.tsx
import SignupForm from '@/components/forms/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Sign Up</h1>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
