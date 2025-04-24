'use client';

import Link from 'next/link';

// Adjust the props to match your new fields.
// Optionally display a single numeric "ersServiceScore" if you want to store it.
interface ServiceCardProps {
  _id: string;
  name: string;
  description: string;
  category: string;
  serviceCost?: number;    // Replacing "price"
  images?: string[];
  // If you want to display a final numeric score, define a prop like:
  ersServiceScore?: number; 
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  _id,
  name,
  description,
  category,
  serviceCost,
  images,
  ersServiceScore,
}) => {
  return (
    <div className="border p-4 rounded shadow-md hover:shadow-lg transition-shadow">
      {/* Image */}
      {images && images.length > 0 && (
        <img
          src={images[0]}
          alt={name}
          className="w-full h-40 object-cover mb-2 rounded"
        />
      )}

      {/* Details */}
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-gray-600 line-clamp-2">{description}</p>
      <p className="text-sm text-gray-500">Category: {category}</p>
      {serviceCost !== undefined && (
        <p className="text-primary font-bold mt-2">${serviceCost}</p>
      )}

      {/* ERS Score (optional) */}
      {ersServiceScore !== undefined && (
        <p className="text-green-500 font-bold mt-2">
          ERS Score: {ersServiceScore}%
        </p>
      )}

      {/* View Details */}
      <Link href={`/services/${_id}`} className="btn btn-secondary mt-4">
        View Service
      </Link>
    </div>
  );
};

export default ServiceCard;
