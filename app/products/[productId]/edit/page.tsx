'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import EditProductForm from '@/components/forms/products/EditProductForm';
import { Product } from '@/types/types';        


const EditProductPage = () => {
  
  const { productId } = useParams() as { productId: string };                // /products/[productId]/edit
  const router        = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  /* ─────────────────────────────────────────────
     1)  Fetch the product once we have an id
  ──────────────────────────────────────────────*/
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}`);
        setProduct(data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        router.push('/404');                         // or /dashboard etc.
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  /* ─────────────────────────────────────────────
     2)  Submit handler → PUT /api/products/[id]
  ──────────────────────────────────────────────*/
  const handleFormSubmit = async (formData: Partial<Product>) => {
    try {
      await axios.put(`/api/products/${productId}`, formData);
      router.push(`/products/${productId}`);        // back to product page
    } catch (err) {
      console.error('Error updating product:', err);
      // You might set local error state here if you want feedback
    }
  };

  /* ─────────────────────────────────────────────
     3)  UI states
  ──────────────────────────────────────────────*/
  if (loading)      return <p className="m-6">Loading…</p>;
  if (!product)     return <p className="m-6 text-red-500">Product not found.</p>;

  /* ─────────────────────────────────────────────
     4)  Render
  ──────────────────────────────────────────────*/
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      {/* Pass props the form expects */}
      <EditProductForm product={product} onSubmit={handleFormSubmit} />
    </div>
  );
};

export default EditProductPage;
