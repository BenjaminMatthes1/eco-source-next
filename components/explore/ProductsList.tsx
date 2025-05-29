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

export default function ProductsList() {
  const [products,    setProducts]  = useState<Product[]>([]);
  const [categories,  setCats]      = useState<string[]>([]);
  const [keyword,     setKeyword]   = useState('');
  const [query,       setQuery]     = useState('');   // committed keyword
  const [cat,         setCat]       = useState('');
  const [minPrice,    setMinPrice]  = useState('');
  const [maxPrice,    setMaxPrice]  = useState('');

  /* fetch categories once */
  useEffect(() => {
    axios.get('/api/products/categories')
      .then(r => setCats(r.data.categories))
      .catch(console.error);
  }, []);

  /* fetch products when filters change */
  useEffect(() => {
    const params: any = {};
    if (query)    params.q        = query;
    if (cat)      params.category = cat;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    axios.get('/api/products', { params })
      .then(r => setProducts(r.data.products))
      .catch(console.error);
  }, [query, cat, minPrice, maxPrice]);

  return (
    <div>
      {/* search row */}
      <div className="flex gap-2 mb-4">
        <input
          className="input input-bordered flex-1"
          placeholder="Search products…"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => setQuery(keyword.trim())}
        >
          Search
        </button>
      </div>

      {/* category chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button
            key={c}
            className={`badge px-4 py-2 cursor-pointer ${cat===c ? 'badge-primary' : 'badge-ghost'}`}
            onClick={() => setCat(cat === c ? '' : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* price filters */}
      <div className="flex items-center gap-4 mb-6">
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

      {/* results grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(p => <ProductCard key={p._id} {...p} />)}
      </div>
    </div>
  );
}
