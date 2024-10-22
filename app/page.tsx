// app/page.tsx
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-green-800">
            Empowering a Sustainable Future
          </h1>
          <p className="py-6">One Connection at a Time</p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="btn btn-primary">
              Sign Up
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Log In
            </Link>
          </div>
          {/* Impact Metrics Placeholder */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold">Our Impact</h2>
            <div className="stats shadow mt-4">
              <div className="stat">
                <div className="stat-title">Members</div>
                <div className="stat-value">0</div>
              </div>
              <div className="stat">
                <div className="stat-title">CO2 Saved</div>
                <div className="stat-value">0 kg</div>
              </div>
              <div className="stat">
                <div className="stat-title">Transactions</div>
                <div className="stat-value">0</div>
              </div>
              <div className="stat">
                <div className="stat-title">Products Exchanged</div>
                <div className="stat-value">0</div>
              </div>
            </div>
          </div>
          {/* End of Impact Metrics Placeholder */}
        </div>
      </div>
    </div>
  );
};

export default Home;
