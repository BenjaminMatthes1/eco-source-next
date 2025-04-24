'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}

const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/products/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching product categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params: any = {};
        if (categoryFilter) params.category = categoryFilter;
        const response = await axios.get('/api/products', { params });
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  return (
    <div>
      <div className="flex mb-4">
        {categories.map((category) => (
          <button
            key={category}
            className={`btn mr-2 ${categoryFilter === category ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategoryFilter(category)}
          >
            {category}
          </button>
        ))}
        {categoryFilter && (
          <button className="btn btn-secondary" onClick={() => setCategoryFilter('')}>
            Clear Filter
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
