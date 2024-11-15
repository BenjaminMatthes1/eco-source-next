// components/EcoFutureSection.tsx
import Link from 'next/link';

const EcoFutureSection: React.FC = () => {
  return (
    <section className="relative h-[800px] overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover"
          src="videos/Main_Video.mov"
          autoPlay
          loop
          muted
        ></video>
        <div className="absolute inset-0 bg-green-800 bg-opacity-95 skew-x-[-60deg] origin-top-left -translate-y-96"></div>
      </div>
      <div className="relative z-10 p-12 max-w-xl text-white">
        <h2 className="text-4xl font-bold mb-6">
          Eco-Friendly Resources: The Way of the Future
        </h2>
        <p className="text-lg mb-6">
          As we move forward, it's becoming increasingly clear that sustainable, eco-friendly resources are the key to a greener planet. Our platform connects buyers with suppliers who prioritize sustainability.
        </p>
        <Link href="/blog" className="text-xl font-bold hover:text-green-400">
          Learn more on our blog →
        </Link>
      </div>
    </section>
  );
};

export default EcoFutureSection;