'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  description: string;
}

const DashboardProducts = ({ userId }: { userId: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/products`);
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching user products:', error);
      }
    };

    if (userId) {
      fetchProducts();
    }
  }, [userId]);

  return (
    <div className="bg-neutral rounded-lg shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Your Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="p-4 bg-white border rounded shadow-md hover:shadow-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => router.push(`/products/${product._id}`)}
          >
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        ))}
        <button
          onClick={() => router.push('/products/new')}
          className="mt-2 p-2 btn-primary"
        >
          + Add New Product
        </button>
      </div>
    </div>
  );
};

export default DashboardProducts;
