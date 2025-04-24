// app/signup/page.tsx
import SignupForm from '@/components/forms/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full p-0 bg-white shadow-lg rounded-lg">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
