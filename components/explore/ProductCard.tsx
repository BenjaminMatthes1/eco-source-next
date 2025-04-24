'use client';

import Link from 'next/link';
// Optional import if you want to compute or display ERS on the card
// import { calculateERSProductScore } from '@/services/ersMetricsService';

interface ProductCardProps {
  _id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  // If you want to display an actual score, store it or compute it
  ersScore?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  _id,
  name,
  description,
  price,
  images = [],
  ersScore,
}) => {
  // If you only have the raw product data, you could also do:
  // const score = calculateERSProductScore({ ... });
  // or fetch it from the server.

  return (
    <div className="border p-4 rounded shadow-md hover:shadow-lg transition-shadow">
      {/* Image */}
      {images.length > 0 && (
        <img
          src={images[0]}
          alt={name}
          className="w-full h-40 object-cover mb-2 rounded"
        />
      )}

      {/* Details */}
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-gray-600 line-clamp-2">{description}</p>
      <p className="text-primary font-bold mt-2">${price}</p>

      {/* ERS Metrics / Score */}
      {ersScore !== undefined && (
        <p className="text-green-500 font-bold mt-2">ERS Score: {ersScore}%</p>
      )}

      {/* View Details */}
      <Link href={`/products/${_id}`} className="btn btn-secondary mt-4">
        View Product
      </Link>
    </div>
  );
};

export default ProductCard;
