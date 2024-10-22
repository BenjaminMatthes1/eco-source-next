// components/NavBar.tsx
import Link from 'next/link';

const NavBar: React.FC = () => {
  return (
    <nav className="navbar bg-base-100 shadow">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Eco-Source
        </Link>
      </div>
      <div className="flex-none">
        <Link href="/signup" className="btn btn-primary">
          Sign Up
        </Link>
        <Link href="/login" className="btn btn-secondary ml-2">
          Log In
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;

