'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import ServiceCard from './ServiceCard';

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  images?: string[];
}

const ServicesList = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/services/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching service categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const params: any = {};
        if (categoryFilter) params.category = categoryFilter;
        const response = await axios.get('/api/services', { params });
        setServices(response.data.services);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
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
        {services.map((service) => (
          <ServiceCard key={service._id} {...service} />
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
