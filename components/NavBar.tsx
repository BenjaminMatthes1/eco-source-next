// components/NavBar.tsx
import Link from 'next/link';
import Image from 'next/image';

const NavBar: React.FC = () => {
  return (
    <nav className="navbar fixed top-0 left-0 right-0 bg-base-100 shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
      <div className="flex-1">
        <Link href="/" className="flex items-center">
          <Image
            src="/Main-Logo-Transparent.png"
            alt="Logo"
            width={50}
            height={50}
            className="mr-2"
          />
          <span className="text-xl font-bold">Eco-Source</span>
        </Link>
      </div>
      <div className="flex-none gap-4">
        <Link href="/contact" className="btn btn-ghost">
          Contact Us
        </Link>
        <Link href="/blog" className="btn btn-ghost">
          Blog
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
