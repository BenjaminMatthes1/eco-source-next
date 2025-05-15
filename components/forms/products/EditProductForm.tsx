'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { Product, UploadedDocument, Photo } from '@/types/types';
import { FaLeaf } from 'react-icons/fa';
import CategorySelect from '@/components/forms/CategorySelect';
import MetricSelect from '../MetricSelect';
import { METRIC_SELECT_OPTIONS } from '@/utils/metricOptions';
import Select, {SingleValue} from 'react-select';
import { dropdownListStyle } from '@/utils/selectStyles';
import { metricLabel } from '@/utils/metricOptions';


type Option = { value: string; label: string };
// Possible doc categories
const DOCUMENT_CATEGORY_OPTIONS = [
  'FairTradeCert',
  'LCADocument',
  'MSDS',
  'EcoLabel',
  'Other',
];

interface EditProductFormProps {
  product: Product;
  onSubmit: (updatedData: Product) => Promise<void>;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSubmit }) => {
  const [error, setError] = useState('');

  // Convert existing product fields into synergy-based local state
  // We'll keep these top-level: _id, name, description, price, etc.
  // But move any old environment fields into synergy if you want to load them.
  // For demonstration, let's do a "chosenMetrics" + "metrics" approach:
  const initialChosen = product.chosenMetrics || [];
  const initialMetrics = { ...product.metrics };

  // Local state for synergy
  const [chosenMetrics, setChosenMetrics] = useState<string[]>([...initialChosen]);
  const [metrics, setMetrics] = useState<Record<string, any>>({ ...initialMetrics });

  // Basic fields (name, description, price, etc.)
  const [name, setName] = useState(product.name || '');
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price || 0);
  const [categories, setCategories] = useState<string[]>(product.categories || []);

  // Documents & Photos
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>(
    product.uploadedDocuments || []
  );
  const [photos, setPhotos] = useState<Photo[]>(product.photos || []);

  // For doc upload
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState<string>('');
  const [uploadError, setUploadError] = useState('');

  // For photo upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoUploadError, setPhotoUploadError] = useState('');

  // For synergy: "Add ERS Metric" dropdown
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  // -----------------------------
  // 1) Basic handle changes
  // -----------------------------
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrice(parseFloat(e.target.value) || 0);
  };


  // -----------------------------
  // 2) Synergy Add / Remove
  // -----------------------------
  const handleAddMetric = () => {
    if (!selectedMetric) return;
    if (chosenMetrics.includes(selectedMetric)) return; // skip duplicates

    let initialValue: any = '';
    if (selectedMetric === 'recyclable') {
      initialValue = false;
    } else if (selectedMetric === 'costEffectiveness' || selectedMetric === 'economicViability') {
      initialValue = ''; 
    } else if (selectedMetric === 'materials') {
      initialValue = []; // array of { name, percentageRecycled, isRenewable }
    } else if (selectedMetric === 'ethicalPractices') {
      initialValue = []; // array of strings
    } else if (
      ['energyUsage', 'energyProduction', 'waterUsage', 'waterRecycled',
       'carbonEmissions', 'carbonOffsets', 'wasteGenerated', 'wasteRecycled'].includes(selectedMetric)
    ) {
      // numeric + unit
      initialValue = { value: '', unit: '' };
    }

    setChosenMetrics((prev) => [...prev, selectedMetric]);
    setMetrics((prev) => ({ ...prev, [selectedMetric]: initialValue }));
    setSelectedMetric('');
  };

  const handleRemoveMetric = (metricKey: string) => {
    setChosenMetrics((prev) => prev.filter((m) => m !== metricKey));
    setMetrics((prev) => {
      const newObj = { ...prev };
      delete newObj[metricKey];
      return newObj;
    });
  };

  // -----------------------------
  // 3) Render synergy
  // -----------------------------
  const renderMetricInput = (metricKey: string) => {
    const val = metrics[metricKey];

    // Peer cost
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

    // Recyclable -> boolean
    if (metricKey === 'recyclable' && typeof val === 'boolean') {
      return (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={val}
              onChange={(e) => {
                setMetrics((prev) => ({ ...prev, [metricKey]: e.target.checked }));
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

    // Materials
    if (metricKey === 'materials' && Array.isArray(val)) {
      return renderMaterialsArray(val);
    }

    // EthicalPractices
    if (metricKey === 'ethicalPractices' && Array.isArray(val)) {
      return renderEthicalPracticesArray(val);
    }

    // Numeric usage with unit
    if (
      ['energyUsage', 'energyProduction', 'waterUsage', 'waterRecycled',
       'carbonEmissions', 'carbonOffsets', 'wasteGenerated', 'wasteRecycled'].includes(metricKey)
      && typeof val === 'object'
    ) {
      return renderNumericWithUnit(metricKey, val);
    }

    // Fallback numeric
    return (
      <div className="flex items-center justify-between gap-2">
        <input
          type="number"
          value={val}
          onChange={(e) => {
            setMetrics((prev) => ({ ...prev, [metricKey]: e.target.value }));
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

  // Materials sub-form
  const renderMaterialsArray = (arrVal: any[]) => {
    const addMat = () => {
      const newArr = [...arrVal, { name: '', percentageRecycled: 0, isRenewable: false }];
      setMetrics((prev) => ({ ...prev, materials: newArr }));
    };

    const updateMat = (idx: number, field: 'name' | 'percentageRecycled' | 'isRenewable', v: any) => {
      const newArr = [...arrVal];
      newArr[idx] = { ...newArr[idx], [field]: v };
      setMetrics((prev) => ({ ...prev, materials: newArr }));
    };

    const removeMat = (idx: number) => {
      const newArr = [...arrVal];
      newArr.splice(idx, 1);
      setMetrics((prev) => ({ ...prev, materials: newArr }));
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

  // EthicalPractices sub-form
  const renderEthicalPracticesArray = (arrVal: any[]) => {
    const KNOWN_PRACTICES = [
      'Fair Trade Certified',
      'No Child Labor',
      'Living Wage Employer',
      'Local Sourcing',
      'Cruelty-Free',
      'Other',
    ];

    const togglePractice = (p: string) => {
      let newArr = [...arrVal];
      if (newArr.includes(p)) {
        newArr = newArr.filter((x) => x !== p);
      } else {
        newArr.push(p);
      }
      setMetrics((prev) => ({ ...prev, ethicalPractices: newArr }));
    };

    return (
      <div className="space-y-2">
        <p className="text-sm">Select relevant ethical practices:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {KNOWN_PRACTICES.map((practice) => (
            <label key={practice} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={arrVal.includes(practice)}
                onChange={() => togglePractice(practice)}
                className="h-4 w-4 text-white border-white"
              />
              <span>{practice}</span>
            </label>
          ))}
        </div>
        {arrVal.length > 0 && (
          <div className="mt-2">
            <h5 className="text-xs font-medium mb-1">Chosen Practices:</h5>
            <ul className="list-disc list-inside text-xs">
              {arrVal.map((p, i) => <li key={i}>{p}</li>)}
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

  // Numeric + Unit
  const renderNumericWithUnit = (metricKey: string, objVal: { value: string; unit: string }) => {
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

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Value"
            value={objVal.value}
            onChange={(e) => {
              setMetrics((prev) => ({
                ...prev,
                [metricKey]: { ...objVal, value: e.target.value },
              }));
            }}
            className="w-1/2 bg-transparent border-b border-white text-white"
          />
          <select
            value={objVal.unit}
            onChange={(e) => {
              setMetrics((prev) => ({
                ...prev,
                [metricKey]: { ...objVal, unit: e.target.value },
              }));
            }}
            className="w-1/2 bg-transparent border-b border-white text-white"
          >
            <option value="">-- Unit --</option>
            {possibleUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
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

  // -----------------------------
  // 4) Doc Upload
  // -----------------------------
  const handleDocUpload = async () => {
    if (!docFile) {
      setUploadError('No file selected.');
      return;
    }
    if (!docCategory) {
      setUploadError('Please select a category.');
      return;
    }
    setUploadError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', docFile);
      formDataToSend.append('category', docCategory);

      // We assume product._id is the DB ID
      const res = await fetch(`/api/products/${product._id}/upload-doc`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to upload document');
      }

      const newDoc = (await res.json()) as UploadedDocument;
      setUploadedDocuments((prev) => [...prev, newDoc]);

      setDocFile(null);
      setDocCategory('');
      const el = document.getElementById('productDocInput') as HTMLInputElement | null;
      if (el) el.value = '';
    } catch (err: any) {
      console.error('Doc upload error:', err);
      setUploadError(err.message);
    }
  };

  const handleDeleteDoc = async (doc: UploadedDocument) => {
    try {
      const res = await fetch(`/api/products/${product._id}/docs/${doc._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete document');
      }
      setUploadedDocuments((prev) => prev.filter((d) => d._id !== doc._id));
    } catch (err: any) {
      console.error('Error deleting doc:', err);
      setUploadError(err.message);
    }
  };

  // -----------------------------
  // 5) Photo Upload
  // -----------------------------
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const handlePhotoUpload = async () => {
    try {
      for (const file of photoFiles) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        const res = await fetch(`/api/products/${product._id}/upload-photo`, {
          method: 'POST',
          body: formDataToSend,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to upload photo');
        }

        const newPhoto = (await res.json()) as Photo;
        setPhotos((prev) => [...prev, newPhoto]);
      }
      setPhotoFiles([]);
      (document.getElementById('photoUpload') as HTMLInputElement).value = '';
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      setPhotoUploadError(err.message);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/products/${product._id}/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete photo');
      }
      setPhotos((prev) => prev.filter((p) => p._id !== photoId));
    } catch (err: any) {
      console.error('Error deleting photo:', err);
    }
  };

  // -----------------------------
  // 6) Submit the entire updated product
  // -----------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Build final updated data
      const updated: Product = {
        ...product,
        name,
        description,
        price,
        categories,
        chosenMetrics,
        metrics,
        uploadedDocuments, // docs
        photos,            // photos
      };

      await onSubmit(updated);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product. Please try again.');
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/abstract-5.jpg"
          alt="Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(255,255,255,.7), rgba(255,255,255,0) 60%)',
          }}
        ></div>
      </div>

      <div className="relative flex flex-1">
        {/* Left side: main form */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="bg-primary bg-opacity-90 text-white p-8 rounded-lg shadow-lg m-4 w-full max-w-md">
            <h2 className="text-4xl font-bold mb-8 text-center">Edit Product</h2>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={handleDescriptionChange}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white">Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={handlePriceChange}
                  min={0}
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Categories</label>
                <CategorySelect value={categories} onChange={setCategories} />
              </div>

              {/* Synergy Add Metric */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-1">+ Add ERS Metric</h3>

                <div className="flex items-center gap-2">
                  {/* NEW styled picker */}
                  <MetricSelect
                    value={selectedMetric}
                    onChange={setSelectedMetric}
                    options={METRIC_SELECT_OPTIONS}
                    

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

              {/* Synergy: chosen metrics */}
              {chosenMetrics.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold">ERS Metrics</h4>
                  {chosenMetrics.map((metricKey) => (
                    <div key={metricKey}>
                      <label className="block text-xs font-medium mb-1">{metricKey}</label>
                      {renderMetricInput(metricKey)}
                    </div>
                  ))}
                </div>
              )}

              {/* Document upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-white">Upload Documents</label>
                <input
                  id="serviceDocInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setDocFile(e.target.files[0]);
                    }
                  }}
                  className="text-sm text-white mt-1"
                />

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 min-w-0">
                    <Select
                      options={[
                        { value: '', label: 'Select Category' },
                        ...DOCUMENT_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c })),
                      ]}
                      value={
                        docCategory
                          ? { value: docCategory, label: docCategory }
                          : { value: '', label: 'Select Category' }
                      }
                      onChange={(opt) => setDocCategory(opt?.value ?? '')}
                      styles={dropdownListStyle}
                      classNamePrefix="react-select"
                      placeholder="Category…"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDocUpload}
                    className="btn btn-secondary "
                  >
                    Upload Doc
                  </button>
                </div>
                {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}

                {/* Existing docs */}
                {uploadedDocuments.length > 0 && (
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {uploadedDocuments.map((doc) => (
                      <li key={doc._id} className="flex items-center gap-3">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline"
                        >
                          {doc.name}
                        </a>
                        <span className="text-white text-xs">
                          {doc.category} - {doc.verified ? 'Verified' : 'Pending'}
                        </span>
                        <button
                          type="button"
                          className="text-red-500 hover:underline ml-auto text-xs"
                          onClick={() => handleDeleteDoc(doc)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="btn btn-secondary w-full mt-4 font-semibold"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Right side: Photos + Info */}
        <div className="w-1/2 hidden md:flex flex-col items-center justify-center">
          <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg m-4 max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-primary">Update Your Product</h2>
            <p className="mb-4 text-primary font-redditLight">
              Keep your product info up to date. Customers rely on accurate details to make 
              responsible, eco-friendly decisions.
            </p>
            <ul className="list-disc list-inside mb-4 text-primary font-redditLight">
              <li>Showcase your new eco innovations</li>
              <li>Highlight updated ethical or sustainable practices</li>
              <li>Maintain credibility with verified docs</li>
            </ul>
            <p className="mb-4 text-primary font-redditLight">
              Stay current and stay green!
            </p>
          </div>

          {/* Photo Section */}
          <div className="bg-primary bg-opacity-90 p-4 rounded-lg shadow-lg m-4 w-full max-w-md">
            <h3 className="text-2xl font-bold text-white mb-2">Product Photos</h3>

            {/* Display existing photos */}
            <div className="flex flex-wrap gap-4 mb-4">
              {photos.map((photo) => (
                <div key={photo._id} className="relative w-24 h-24">
                  <img
                    src={photo.url}
                    alt={photo.name || 'Product Photo'}
                    className="object-cover w-full h-full border border-gray-300 rounded"
                  />
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => handleDeletePhoto(photo._id.toString())}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {/* Photo upload input */}
            {photoUploadError && <p className="text-red-500 text-sm">{photoUploadError}</p>}
            <input
              id="photoUpload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setPhotoFiles(Array.from(e.target.files));
                }
              }}
            />
            <label
              htmlFor="photoUpload"
              className="btn-tertiary pt-2 pb-4"
            >
              <FaLeaf className="mr-2" />
              <span>Select Photo(s)</span>
            </label>
            <button
              type="button"
              onClick={handlePhotoUpload}
              className="btn btn-secondary ml-4"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;
