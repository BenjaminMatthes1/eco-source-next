'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  photos?: { url: string }[];
  categories?: string[];
  metrics?: { overallScore: number };
}

export default function ProductsList() {
  const [products,   setProducts] = useState<Product[]>([]);
  const [categories, setCats]     = useState<string[]>([]);
  const [keyword,    setKeyword]  = useState('');
  const [cat,        setCat]      = useState('');
  const [minPrice,   setMinPrice] = useState('');
  const [maxPrice,   setMaxPrice] = useState('');

  /* fetch distinct categories once */
  useEffect(() => {
    axios.get('/api/products/categories')
      .then(r => setCats(r.data.categories))
      .catch(console.error);
      
  }, []);

  /* fetch products whenever a filter changes */
  useEffect(() => {
    const params: any = {};
    if (keyword.trim()) params.q        = keyword.trim();
    if (cat)            params.category = cat;
    if (minPrice)       params.minPrice = minPrice;
    if (maxPrice)       params.maxPrice = maxPrice;

    axios.get('/api/products', { params })
      .then(r => setProducts(r.data.products))
      .catch(console.error);
  }, [keyword, cat, minPrice, maxPrice]);

  return (
    <div>
      {/* ───── search & price filters row ───── */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          className="input input-bordered flex-1 min-w-[200px]"
          placeholder="Search name or description…"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />

        <label className="flex flex-col text-xs">
          Min $
          <input
            type="number"
            className="input input-sm input-bordered mt-1"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            min={0}
          />
        </label>

        <label className="flex flex-col text-xs">
          Max $
          <input
            type="number"
            className="input input-sm input-bordered mt-1"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            min={0}
          />
        </label>
      </div>

      {/* ───── category chips ───── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(c => (
          <button
            key={c}
            className={`badge px-4 py-2 cursor-pointer ${cat === c ? 'badge-primary' : 'badge-ghost'}`}
            onClick={() => setCat(cat === c ? '' : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ───── results grid ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map(p => (
          <ProductCard key={p._id} {...p} />
        ))}
      </div>
    </div>
  );
}
