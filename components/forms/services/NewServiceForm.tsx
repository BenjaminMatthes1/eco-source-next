'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CategorySelect from '@/components/forms/CategorySelect';
import MetricSelect from '../MetricSelect';
import { SERVICE_METRICS } from '@/utils/metricOptions';
import Select, {SingleValue} from 'react-select';
import { dropdownListStyle } from '@/utils/selectStyles';
import { metricLabel } from '@/utils/metricOptions';

// If you have a separate ServiceFormData interface in your types,
// it would look like: 
// interface ServiceFormData {
//   userId: string;
//   name: string;
//   description: string;
//   category: string;
//   serviceCost: number;
//   chosenMetrics: string[];
//   metrics: Record<string, any>;
// }
type Option = { value: string; label: string };

interface NewServiceFormProps {
  currentUserId: string; // from session or context
}


const NewServiceForm: React.FC<NewServiceFormProps> = ({ currentUserId }) => {
  const router = useRouter();

  // Main service form data
  const [formData, setFormData] = useState<{
    userId: string;
    name: string;
    description: string;
    categories: string[];
    serviceCost: number; 
    chosenMetrics: string[];
    metrics: Record<string, any>;
  }>({
    userId: currentUserId,
    name: '',
    description: '',
    categories: [],
    serviceCost: 0,
    chosenMetrics: [],
    metrics: {},
  });

  // Track the selected synergy metric from the dropdown
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [error, setError] = useState('');

  // -------------------------
  // A) Basic Info Handlers
  // -------------------------
  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'serviceCost') {
      const parsed = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        serviceCost: Number.isNaN(parsed) ? 0 : parsed,
      }));
    } else if (name !== 'categories') {       // ← skip; handled separately
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // -------------------------
  // B) Add / Remove synergy metric
  // -------------------------
  const handleAddMetric = () => {
    if (!selectedMetric) return;
    if (formData.chosenMetrics.includes(selectedMetric)) return; // skip duplicates

    // Initialize default values
    let initialValue: any = '';

    if (selectedMetric === 'recyclable') {
      initialValue = false;
    } else if (['costEffectiveness', 'economicViability'].includes(selectedMetric)) {
      initialValue = 0; 
    } else if (selectedMetric === 'materials') {
      initialValue = [];  // array of { name, percentageRecycled, isRenewable }
    } else if (selectedMetric === 'ethicalPractices') {
      initialValue = [];  // array of strings
    } else if (
      // metrics that might be numeric with a unit
      ['energyUsage', 'energyProduction', 'waterUsage', 'waterRecycled',
       'carbonEmissions', 'carbonOffsets', 'wasteGenerated', 'wasteRecycled'].includes(selectedMetric)
    ) {
      initialValue = { value: '', unit: '' }; 
    }

    setFormData((prev) => ({
      ...prev,
      chosenMetrics: [...prev.chosenMetrics, selectedMetric],
      metrics: { ...prev.metrics, [selectedMetric]: initialValue },
    }));
    setSelectedMetric('');
  };

  const handleRemoveMetric = (metricKey: string) => {
    setFormData((prev) => ({
      ...prev,
      chosenMetrics: prev.chosenMetrics.filter((m) => m !== metricKey),
      metrics: Object.fromEntries(
        Object.entries(prev.metrics).filter(([k]) => k !== metricKey)
      ),
    }));
  };

  // -------------------------
  // C) Render synergy metric inputs
  // -------------------------
  const renderMetricInput = (metricKey: string) => {
    const val = formData.metrics[metricKey];

    // 1) peerCostEffectiveness => no direct input
    if (metricKey === 'peerCostEffectiveness') {
      return (
        <div className="flex items-center justify-between">
          <p className="text-sm italic">
            Peer Cost Rating enabled (no direct input)
          </p>
          <button
            type="button"
            onClick={() => handleRemoveMetric(metricKey)}
            className="text-xs text-red-300 hover:text-red-500"
          >
            Remove
          </button>
        </div>
      );
    }

    // 2) Recyclable => boolean
    if (metricKey === 'recyclable' && typeof val === 'boolean') {
      return (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={val}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  metrics: { ...prev.metrics, [metricKey]: e.target.checked },
                }));
              }}
              className="h-4 w-4 text-white border-white"
            />
            <span className="text-sm">Recyclable</span>
          </label>
          <button
            type="button"
            onClick={() => handleRemoveMetric(metricKey)}
            className="text-xs text-red-300 hover:text-red-500"
          >
            Remove
          </button>
        </div>
      );
    }

    // 3) Materials => array of objects
    if (metricKey === 'materials' && Array.isArray(val)) {
      return renderMaterialsArray(val);
    }

    // 4) EthicalPractices => array of strings
    if (metricKey === 'ethicalPractices' && Array.isArray(val)) {
      return renderEthicalPracticesArray(val);
    }

    // 5) Numeric with units => store as { value, unit }
    if (
      ['energyUsage', 'energyProduction', 'waterUsage', 'waterRecycled',
       'carbonEmissions', 'carbonOffsets', 'wasteGenerated', 'wasteRecycled'].includes(metricKey)
      && typeof val === 'object'
    ) {
      return renderNumericWithUnit(metricKey, val);
    }

    // 6) default numeric => plain input
    return (
      <div className="flex items-center justify-between gap-2">
        <input
          type="number"
          value={val}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              metrics: { ...prev.metrics, [metricKey]: e.target.value },
            }));
          }}
          className="mt-1 block w-full text-white bg-transparent border-b border-white 
                     focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
        />
        <button
          type="button"
          onClick={() => handleRemoveMetric(metricKey)}
          className="text-xs text-red-300 hover:text-red-500"
        >
          Remove
        </button>
      </div>
    );
  };

  // C1) Materials sub-form
  const renderMaterialsArray = (arrVal: any[]) => {
    const addMat = () => {
      const newArr = [...arrVal, { name: '', percentageRecycled: 0, isRenewable: false }];
      setFormData((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, materials: newArr },
      }));
    };

    const updateMat = (idx: number, field: 'name' | 'percentageRecycled' | 'isRenewable', v: any) => {
      const newArr = [...arrVal];
      newArr[idx] = { ...newArr[idx], [field]: v };
      setFormData((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, materials: newArr },
      }));
    };

    const removeMat = (idx: number) => {
      const newArr = [...arrVal];
      newArr.splice(idx, 1);
      setFormData((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, materials: newArr },
      }));
    };

    return (
      <div className="space-y-2">
        <p className="text-sm">Materials (Name, % Recycled, Renewable)</p>
        {arrVal.map((mat, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <input
              type="text"
              placeholder="Material Name"
              value={mat.name}
              onChange={(e) => updateMat(i, 'name', e.target.value)}
              className="bg-transparent border-b border-white w-1/3"
            />
            <input
              type="number"
              placeholder="% Recycled"
              value={mat.percentageRecycled}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateMat(i, 'percentageRecycled', val);
              }}
              min={0}
              max={100}
              className="bg-transparent border-b border-white w-1/4"
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={mat.isRenewable}
                onChange={(e) => updateMat(i, 'isRenewable', e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-xs">Renewable</span>
            </label>
            <button
              type="button"
              onClick={() => removeMat(i)}
              className="text-xs text-red-300 hover:text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMat}
          className="text-sm text-white underline hover:text-secondary"
        >
          + Add Material
        </button>
        <button
          type="button"
          onClick={() => handleRemoveMetric('materials')}
          className="text-xs text-red-300 hover:text-red-500 block mt-2"
        >
          Remove Materials
        </button>
      </div>
    );
  };

  // C2) EthicalPractices sub-form
  const renderEthicalPracticesArray = (arrVal: any[]) => {
    // example known practices
    const KNOWN_PRACTICES = [
      'Fair Trade Certified',
      'No Child Labor',
      'Living Wage Employer',
      'Local Sourcing',
      'Cruelty-Free',
      'Other',
    ];

    const togglePractice = (practice: string) => {
      let newArr = [...arrVal];
      if (newArr.includes(practice)) {
        newArr = newArr.filter((p) => p !== practice);
      } else {
        newArr.push(practice);
      }
      setFormData((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, ethicalPractices: newArr },
      }));
    };

    return (
      <div className="space-y-2">
        <p className="text-sm">Select relevant ethical practices:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {KNOWN_PRACTICES.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={arrVal.includes(p)}
                onChange={() => togglePractice(p)}
                className="h-4 w-4 text-white border-white"
              />
              <span>{p}</span>
            </label>
          ))}
        </div>
        {arrVal.length > 0 && (
          <div className="mt-2">
            <h5 className="text-xs font-medium mb-1">Chosen Practices:</h5>
            <ul className="list-disc list-inside text-xs">
              {arrVal.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={() => handleRemoveMetric('ethicalPractices')}
          className="text-xs text-red-300 hover:text-red-500 block mt-2"
        >
          Remove Ethical Practices
        </button>
      </div>
    );
  };

  // C3) Numeric usage with units => store as { value, unit }
  const renderNumericWithUnit = (metricKey: string, objVal: { value: string; unit: string }) => {
    // You might define sets of possible units
    const ENERGY_UNITS = ['kWh', 'MJ', 'MWh'];
    const WATER_UNITS = ['liters', 'gallons'];
    const CARBON_UNITS = ['kg', 'tons'];
    const WASTE_UNITS = ['kg', 'tons', 'lbs'];
    

    let possibleUnits: string[] = [];
    if (['energyUsage', 'energyProduction'].includes(metricKey)) {
      possibleUnits = ENERGY_UNITS;
    } else if (['waterUsage', 'waterRecycled'].includes(metricKey)) {
      possibleUnits = WATER_UNITS;
    } else if (['carbonEmissions', 'carbonOffsets'].includes(metricKey)) {
      possibleUnits = CARBON_UNITS;
    } else if (['wasteGenerated', 'wasteRecycled'].includes(metricKey)) {
      possibleUnits = WASTE_UNITS;
    }

    const unitOptions: Option[] = possibleUnits.map((u) => ({
      value: u,
      label: u,
    }));

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Value"
            value={objVal.value}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                metrics: {
                  ...prev.metrics,
                  [metricKey]: {
                    ...objVal,
                    value: e.target.value,
                  },
                },
              }));
            }}
            className="mt-4 block w-half text-white bg-transparent border-b border-white 
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
          />
          {/* unit dropdown */}
          <Select<Option, false>                /*  ⬅  generic <Option, isMulti=false> */
            options={unitOptions}
            value={
              objVal.unit
                ? unitOptions.find((o) => o.value === objVal.unit) ?? null
                : null
            }
            onChange={(opt: SingleValue<Option>) =>
              setFormData((prev) => ({
                ...prev,
                metrics: {
                  ...prev.metrics,
                  [metricKey]: { ...objVal, unit: opt ? opt.value : '' },
                },
              }))
            }
            styles={dropdownListStyle}
            classNamePrefix="react-select"
            placeholder="-Unit-"
            isClearable
          />
        </div>
        <button
          type="button"
          onClick={() => handleRemoveMetric(metricKey)}
          className="text-xs text-red-300 hover:text-red-500 self-end"
        >
          Remove
        </button>
      </div>
    );
  };

  // -------------------------
  // D) Submit
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Let the backend handle numeric parsing & conversions
      const finalMetrics = { ...formData.metrics };

      // Build final payload
      const payload = {
        userId: formData.userId,
        name: formData.name,
        description: formData.description,
        categories: formData.categories,
        serviceCost: formData.serviceCost,
        chosenMetrics: formData.chosenMetrics,
        metrics: finalMetrics,
      };

      await axios.post('/api/services', payload);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating service:', err);
      setError('Failed to create service. Please try again.');
    }
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/abstract-5.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 60%)',
          }}
        />
      </div>

      <div className="relative flex flex-1">
        {/* Left Column - New Service Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="bg-primary bg-opacity-90 text-white p-8 rounded-lg shadow-lg m-4 w-full max-w-xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Create a New Service</h1>

            {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleBasicChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white 
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm font-redditLight"
                  placeholder="e.g. Eco-Friendly Consulting"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleBasicChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white 
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm font-redditLight"
                  rows={2}
                  placeholder="Short description of the service"
                />
              </div>

              {/* Category */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Categories
                </label>

                <CategorySelect
                  value={formData.categories}
                  onChange={(vals) =>
                    setFormData({ ...formData, categories: vals })
                  }
                />
              </div>

              {/* Service Cost */}
              <div>
                <label className="block text-sm font-medium">Service Cost ($)</label>
                <input
                  type="number"
                  name="serviceCost"
                  value={formData.serviceCost}
                  onChange={handleBasicChange}
                  min={0}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white 
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>

              {/* Add synergy metric */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-1">+ Add ERS Metric</h3>

                <div className="flex items-center gap-2">
                  {/* NEW styled picker */}
                  <MetricSelect
                    value={selectedMetric}
                    onChange={setSelectedMetric}
                  />

                  <button
                    type="button"
                    onClick={handleAddMetric}
                    className="btn btn-sm btn-accent"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Render chosen metrics */}
              {formData.chosenMetrics.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold">Selected ERS Metrics</h4>
                  {formData.chosenMetrics.map((metricKey) => (
                    <div key={metricKey}>
                      <label className="block text-xs font-medium mb-1">
                        {metricLabel(metricKey)}
                      </label>
                      {renderMetricInput(metricKey)}
                    </div>
                  ))}
                </div>
              )}

              {/* Info about uploading docs later */}
              <div className="mt-8 p-4 bg-neutral bg-opacity-20 rounded">
                <h2 className="text-md font-semibold mb-2">Want to upload photos or documents?</h2>
                <p className="text-sm">
                  Once your service is created, you can upload additional media 
                  in the “Edit Service” page.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-secondary w-full mt-6 font-semibold tracking-wide"
              >
                Create Service
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Additional Info (optional) */}
        <div className="hidden md:flex w-1/2 items-center justify-center">
          <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg m-4 max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-primary">
              Add a Sustainable Service
            </h2>
            <p className="text-primary mb-4">
              By listing your eco-friendly service on Eco-Source, you:
            </p>
            <ul className="list-disc list-inside text-primary mb-4">
              <li>Connect with environmentally conscious clients</li>
              <li>Showcase green practices and metrics</li>
              <li>Help create a more sustainable future</li>
            </ul>
            <p className="text-primary">
              Ready to share your service with an audience that cares about the planet?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewServiceForm;
