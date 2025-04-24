'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ProductFormData } from '@/types/types';
import CategorySelect from '../CategorySelect';
import { METRIC_SELECT_OPTIONS } from '@/utils/metricOptions';
import MetricSelect from '../MetricSelect';
import Select, {SingleValue} from 'react-select';
import { dropdownListStyle } from '@/utils/selectStyles';
import { metricLabel } from '@/utils/metricOptions';




// We could define custom unit sets for each metric key
// For demonstration, let's unify a few categories
const ENERGY_UNITS = ['kWh', 'MJ', 'MWh'];
const WATER_UNITS = ['liters', 'gallons'];
const CARBON_UNITS = ['kg', 'tons'];
const WASTE_UNITS = ['kg', 'tons', 'lbs'];
type Option = { value: string; label: string };


interface NewProductFormProps {
  currentUserId: string; // from session or context
}

const NewProductForm: React.FC<NewProductFormProps> = ({ currentUserId }) => {
  const router = useRouter();

  // Basic form data
  const [formData, setFormData] = useState<ProductFormData>({
    userId: currentUserId,
    name: '',
    description: '',
    price: 0,
    categories: [],
    chosenMetrics: [],
    metrics: {},
  });

  
  // Track the selected synergy metric from the dropdown
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [error, setError] = useState('');



  

  // -------------------------
  // 1) Basic Info Handlers
  // -------------------------
  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'price') {
      const parsed = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        price: Number.isNaN(parsed) ? 0 : parsed,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // -------------------------
  // 2) Add / Remove synergy metric
  // -------------------------
  const handleAddMetric = () => {
    if (!selectedMetric) return;
    if (formData.chosenMetrics.includes(selectedMetric)) return; // skip if duplicate

    // Initialize the metric's value
    // - For booleans -> false
    // - For peerCostEffectiveness -> 'peer-enabled'
    // - For arrays (materials, ethicalPractices), we'll handle later
    // - For numeric usage -> store { value: '', unit: 'kWh' } or something
    let initialValue: any = '';

    if (selectedMetric === 'recyclable') {
      initialValue = false;
    } else if (['costEffectiveness', 'economicViability'].includes(selectedMetric)) {
      initialValue = 0; 
    } else if (selectedMetric === 'materials') {
      initialValue = []; // array of { name, percentageRecycled, isRenewable }
    } else if (selectedMetric === 'ethicalPractices') {
      initialValue = []; // array of strings
    } else if (
      // example list of metrics that need numeric + unit object
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
  // 3) Render synergy inputs
  // -------------------------
  // For "materials" and "ethicalPractices," we do sub-forms/arrays
  // For numeric usage, we do numeric + unit
  // For booleans, we do a checkbox
  // For peer cost => no direct input
  const renderMetricInput = (metricKey: string) => {
    const currentVal = formData.metrics[metricKey];

    // 3a) Peer ratings
    if (metricKey === 'costEffectiveness') {
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

    if (metricKey === 'economicViability') {
      return (
        <div className="flex items-center justify-between">
          <p className="text-sm italic">
            Peer Economic Viability  Rating enabled (no direct input)
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

    // 3b) Recyclable (boolean)
    if (metricKey === 'recyclable' && typeof currentVal === 'boolean') {
      return (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentVal}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  metrics: {
                    ...prev.metrics,
                    [metricKey]: e.target.checked,
                  },
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

    // 3c) Materials array
    if (metricKey === 'materials' && Array.isArray(currentVal)) {
      return renderMaterialsArray(currentVal);
    }

    // 3d) EthicalPractices array
    if (metricKey === 'ethicalPractices' && Array.isArray(currentVal)) {
      return renderEthicalPracticesArray(currentVal);
    }

    // 3e) Numeric usage with unit => store as { value, unit }
    if (
      ['energyUsage', 'energyProduction', 'waterUsage', 'waterRecycled',
       'carbonEmissions', 'carbonOffsets', 'wasteGenerated', 'wasteRecycled'].includes(metricKey)
      && typeof currentVal === 'object'
    ) {
      return renderNumericWithUnit(metricKey, currentVal);
    }

    // 3f) Possibly percentages or small numeric fields (packagingRecyclability, biodiversityImpact)
    // might be just a single number
    return (
      <div className="flex items-center justify-between gap-2">
        <input
          type="number"
          value={currentVal}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              metrics: {
                ...prev.metrics,
                [metricKey]: e.target.value,
              },
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

  // 3c - Materials sub-form
  const renderMaterialsArray = (arrayVal: any[]) => {
    const addMaterialEntry = () => {
      const newArr = [
        ...arrayVal,
        { name: '', percentageRecycled: 0, isRenewable: false },
      ];
      setFormData((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, materials: newArr },
      }));
    };

    const updateMaterial = (
      idx: number,
      field: 'name' | 'percentageRecycled' | 'isRenewable',
      value: any
    ) => {
      const newArr = [...arrayVal];
      newArr[idx] = { ...newArr[idx], [field]: value };
      setFormData((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, materials: newArr },
      }));
    };

    const removeMaterialEntry = (idx: number) => {
      const newArr = [...arrayVal];
      newArr.splice(idx, 1);
      setFormData((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, materials: newArr },
      }));
    };

    return (
      <div className="space-y-2">
        <p className="text-sm">Add Materials (Name, % Recycled, Renewable)</p>
        {arrayVal.map((mat, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <input
              type="text"
              placeholder="Material Name"
              value={mat.name}
              onChange={(e) => updateMaterial(i, 'name', e.target.value)}
              className="bg-transparent border-b border-white w-1/3"
            />
            <input
              type="number"
              placeholder="% Recycled"
              value={mat.percentageRecycled}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateMaterial(i, 'percentageRecycled', val);
              }}
              min={0}
              max={100}
              className="bg-transparent border-b border-white w-1/4"
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={mat.isRenewable}
                onChange={(e) => updateMaterial(i, 'isRenewable', e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-xs">Renewable</span>
            </label>
            <button
              type="button"
              onClick={() => removeMaterialEntry(i)}
              className="text-xs text-red-300 hover:text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMaterialEntry}
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

  // 3d - EthicalPractices sub-form
  const renderEthicalPracticesArray = (arrayVal: any[]) => {
    // Could be a multi-check approach or add practices manually
    // For simplicity, let's let them pick from a known list
    const KNOWN_PRACTICES = [
      'Fair Trade Certified',
      'No Child Labor',
      'Living Wage Employer',
      'Local Sourcing',
      'Cruelty-Free',
      'Other',
    ];

    const togglePractice = (practice: string) => {
      let newArray = [...arrayVal];
      if (newArray.includes(practice)) {
        newArray = newArray.filter((p) => p !== practice);
      } else {
        newArray.push(practice);
      }
      setFormData((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, ethicalPractices: newArray },
      }));
    };

    const removeEthicalAll = () => {
      // remove the entire ethicalPractices
      handleRemoveMetric('ethicalPractices');
    };

    return (
      <div className="space-y-2">
        <p className="text-sm">
          Select which ethical practices apply:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {KNOWN_PRACTICES.map((practice) => (
            <label key={practice} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={arrayVal.includes(practice)}
                onChange={() => togglePractice(practice)}
                className="h-4 w-4 text-white border-white"
              />
              <span>{practice}</span>
            </label>
          ))}
        </div>

        {/* Show which are chosen */}
        {arrayVal.length > 0 && (
          <div className="mt-2">
            <h5 className="text-xs font-medium mb-1">Chosen Practices:</h5>
            <ul className="list-disc list-inside text-xs">
              {arrayVal.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={removeEthicalAll}
          className="text-xs text-red-300 hover:text-red-500 block mt-2"
        >
          Remove Ethical Practices
        </button>
      </div>
    );
  };

  const renderNumericWithUnit = (
    metricKey: string,
    objVal: { value: string; unit: string }
  ) => {
    /**  Decide which unit set to show  */
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
  
    /** Turn them into react-select options */
    const unitOptions: Option[] = possibleUnits.map((u) => ({
      value: u,
      label: u,
    }));
  
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* numeric value */}
          <input
            type="number"
            placeholder="Value"
            value={objVal.value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                metrics: {
                  ...prev.metrics,
                  [metricKey]: { ...objVal, value: e.target.value },
                },
              }))
            }
            className="w-1/2 bg-transparent border-b border-white text-white
                       focus:border-secondary focus:outline-none focus:ring-0"
          />
  
          {/* unit dropdown */}
          <Select<Option, false>
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
  // 4) Submit
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // We'll let the backend handle final numeric parsing & conversion
      // but if you do want to parse here, do it similarly to your old code.
      const finalMetrics: Record<string, any> = { ...formData.metrics };

      // e.g. for any metric that is { value, unit }, we'll keep it as is
      // The backend synergy code will do the final parse
      // or you can parse it now if you like.

      // Build the final payload
      const payload = {
        userId: formData.userId,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categories: formData.categories,
        chosenMetrics: formData.chosenMetrics,
        metrics: finalMetrics,
      };

      await axios.post('/api/products', payload);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product. Please try again.');
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
        {/* Left Column - New Product Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="bg-primary bg-opacity-90 text-white p-8 rounded-lg shadow-lg m-4 w-full max-w-xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Create a New Product</h1>

            {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleBasicChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white 
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="e.g. Reusable Water Bottle"
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
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                  rows={2}
                  placeholder="Provide a brief description"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleBasicChange}
                  min={0}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white 
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>
              

              {/* Categories */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1 text-white">
                  Categories
                </label>

                <CategorySelect
                  value={formData.categories}                // string[]
                  onChange={(vals) =>
                    setFormData({ ...formData, categories: vals })
                  }
                />
              </div>

              {/* + Add ERS Metric */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-1">+ Add ERS Metric</h3>

                <div className="flex items-center gap-2">
                  {/* NEW styled picker */}
                  <MetricSelect
                    options={METRIC_SELECT_OPTIONS}
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
                  After creating your product, you can upload additional media 
                  in the “Edit Product” page.
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-secondary w-full mt-6 font-semibold tracking-wide"
              >
                Create Product
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Additional Info (optional) */}
        <div className="hidden md:flex w-1/2 items-center justify-center">
          <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg m-4 max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-primary">
              Add Your Sustainable Product
            </h2>
            <p className="text-primary mb-4">
              Promote your eco-friendly creations on Eco-Source. By listing your product here, you:
            </p>
            <ul className="list-disc list-inside text-primary mb-4">
              <li>Reach an audience focused on sustainability</li>
              <li>Highlight your use of ethical & renewable materials</li>
              <li>Help shape a greener future!</li>
            </ul>
            <p className="text-primary">
              Start showcasing your product’s eco-friendly features today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProductForm;
