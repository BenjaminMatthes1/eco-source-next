// components/Footer.tsx
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="footer p-10 bg-primary text-neutral-content">
      <div>
        <span className="footer-title text-white">About Us</span>
        <p className='text-white'>
          Eco-Source is dedicated to connecting buyers and suppliers of eco-friendly, sustainable materials.
        </p>
      </div>
      <div>
        <span className="footer-title text-white">Quick Links</span>
        <Link href="/about" className="link link-hover text-white hover:text-secondary">
          About Us
        </Link>
        <Link href="/contact" className="link link-hover text-white hover:text-secondary">
          Contact Us
        </Link>
        <Link href="/blog" className="link link-hover text-white hover:text-secondary">
          Blog
        </Link>
        <Link href="/faq" className="link link-hover text-white hover:text-secondary">
          FAQ
        </Link>
      </div>
      <div>
        <span className="footer-title text-white">Legal</span>
        <Link href="/legal/terms" className="link link-hover text-white hover:text-secondary">
          Terms of Use
        </Link>
        <Link href="/legal/privacy" className="link link-hover text-white hover:text-secondary">
          Privacy Policy
        </Link>
        <Link href="/legal/cookies" className="link link-hover text-white hover:text-secondary">
          Cookie Policy
        </Link>
      </div>
      <div>
        <span className="footer-title text-white">Follow Us</span>
        <div className="grid grid-flow-col gap-4">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-secondary"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-secondary"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-secondary"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-secondary"
          >
            <FaInstagram size={24} />
          </a>
        </div>
      </div>
      <div>
        <span className="footer-title text-white">Contact</span>
        <p className='text-white'>
          Email: admin@eco-source.com<br />
        </p>
      </div>
    </footer>
  );
};

export default Footer;
