// app/login/page.tsx

import LoginForm from '@/components/forms/LoginForm'

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full p-0 bg-white shadow-lg rounded-lg">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
