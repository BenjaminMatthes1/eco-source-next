'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { Service, UploadedDocument, Photo } from '@/types/types';
import { FaLeaf } from 'react-icons/fa';
import CategorySelect from '@/components/forms/CategorySelect';
import MetricSelect from '../MetricSelect';
import { SERVICE_METRICS } from '@/utils/metricOptions';
import Select, { SingleValue } from 'react-select';
import { dropdownListStyle } from '@/utils/selectStyles';
import { metricLabel } from '@/utils/metricOptions';
import PhotoPicker, { ExistingPhoto } from '@/components/forms/PhotoPicker';


const DOCUMENT_CATEGORY_OPTIONS = [
  'FairTradeCert',
  'LCADocument',
  'MSDS',
  'EcoLabel',
  'Other',
];
type Option = { value: string; label: string };

interface EditServiceFormProps {
  service: Service;
  onSubmit: (updatedData: Service) => Promise<void>;
}

const EditServiceForm: React.FC<EditServiceFormProps> = ({ service, onSubmit }) => {
  const [error, setError] = useState('');

  // 1) Convert existing service fields into synergy-based state
  // If your DB already has `chosenMetrics` + `metrics`, use them; else initialize empty
  const [chosenMetrics, setChosenMetrics] = useState<string[]>(service.chosenMetrics || []);
  const [metrics, setMetrics] = useState<Record<string, any>>({ ...service.metrics });

  // 2) Basic service fields
  const [name, setName] = useState(service.name || '');
  const [description, setDescription] = useState(service.description || '');
  const [categories, setCategories] = useState<string[]>(service.categories || []);
  const [price, setPrice] = useState(service.price || 0);

  // 3) Documents & Photos
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>(
    service.uploadedDocuments || []
  );
 
  // Doc & Photo state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<ExistingPhoto[]>(service.photos || []);
  

  // 4) Dropdown for synergy
  const [selectedMetric, setSelectedMetric] = useState('');

  // -----------------------------
  // Basic handle changes
  // -----------------------------
  const handleBasicChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'serviceCost') {
      setPrice(parseFloat(value) || 0);
    } else if (name === 'name') {
      setName(value);
    } else if (name === 'description') {
      setDescription(value);
    }
  };

  // -----------------------------
  // Synergy Add / Remove
  // -----------------------------
  const handleAddMetric = () => {
    if (!selectedMetric) return;
    if (chosenMetrics.includes(selectedMetric)) return;

    let initialValue: any = '';
    if (selectedMetric === 'recyclable') {
      initialValue = false;
    } else if (['costEffectiveness', 'economicViability'].includes(selectedMetric)) {
      initialValue = 0; 
    } else if (selectedMetric === 'materials') {
      initialValue = [];
    } else if (selectedMetric === 'ethicalPractices') {
      initialValue = [];
    } else if (
      ['energyUsage', 'energyProduction', 'waterUsage', 'waterRecycled',
       'carbonEmissions', 'carbonOffsets', 'wasteGenerated', 'wasteRecycled'].includes(selectedMetric)
    ) {
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
  // Render synergy metric input
  // -----------------------------
  const renderMetricInput = (metricKey: string) => {
    const val = metrics[metricKey];

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

    if (metricKey === 'materials' && Array.isArray(val)) {
      return renderMaterialsArray(val);
    }

    if (metricKey === 'ethicalPractices' && Array.isArray(val)) {
      return renderEthicalPracticesArray(val);
    }

    if (
      ['energyUsage', 'energyProduction', 'waterUsage', 'waterRecycled',
       'carbonEmissions', 'carbonOffsets', 'wasteGenerated', 'wasteRecycled'].includes(metricKey)
      && typeof val === 'object'
    ) {
      return renderNumericWithUnit(metricKey, val);
    }

    // fallback numeric input
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

  // Ethical Practices sub-form
  const renderEthicalPracticesArray = (arrVal: any[]) => {
    // your known practices
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

  // Numeric usage w/ units
  const renderNumericWithUnit = (
    metricKey: string,
    objVal: { value: string; unit: string }
  ) => {
    /** decide which unit list to show */
    const ENERGY_UNITS = ['kWh', 'MJ', 'MWh'];
    const WATER_UNITS  = ['liters', 'gallons'];
    const CARBON_UNITS = ['kg', 'tons'];
    const WASTE_UNITS  = ['kg', 'tons', 'lbs'];
  
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
  
    /** convert to react-select options */
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
              setMetrics((prev) => ({
                ...prev,
                [metricKey]: { ...objVal, value: e.target.value },
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
              setMetrics((prev) => ({
                ...prev,
                [metricKey]: { ...objVal, unit: opt ? opt.value : '' },
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

  // -----------------------------
  // Document Upload
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
      const uploadData = new FormData();
      uploadData.append('file', docFile);
      uploadData.append('category', docCategory);
      

      const res = await fetch(`/api/services/${service._id}/upload-doc`, {
        method: 'POST',
        body: uploadData,
      });
      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message || 'Failed to upload document');
      }
      const newDoc = (await res.json()) as UploadedDocument;
      setUploadedDocuments((prev) => [...prev, newDoc]);

      setDocFile(null);
      setDocCategory('');
      (document.getElementById('serviceDocInput') as HTMLInputElement).value = '';
    } catch (err: any) {
      console.error('Doc upload error:', err);
      setUploadError(err.message);
    }
  };

  const handleDeleteDoc = async (doc: UploadedDocument) => {
    try {
      if (!doc._id) throw new Error('Document has no _id');
      const res = await fetch(`/api/services/${service._id}/docs/${doc._id}`, {
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
  // Photo Upload
  // -----------------------------
  
  async function handlePhotoUpload(files: File[]) {
    try {
     for (const file of files) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);
        formDataToSend.append('entity', 'product');
        formDataToSend.append('kind', 'photo');
        formDataToSend.append('category', docCategory);

        const res = await fetch(`/api/services/${service._id}/upload-photo`, {
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
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setUploadError(err.message);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/services/${service._id}/photos/${photoId}`, {
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
  // Submit entire updated service
  // -----------------------------
 async function handleSubmit(e: FormEvent) {
   e.preventDefault();
   setError('');
   
    try {
     // Guarantee each photo has a “key”
     const photosForSave: Photo[] = photos.map((p, idx) => ({
       key: p.key ?? p._id ?? String(idx),   // fallback key
       ...p,
     }));
 
     const updated: Service = {
       ...service,
       name,
       description,
       price,
       categories,
       chosenMetrics,
       metrics,
       uploadedDocuments,
       photos: photosForSave,                // ← use the adapted array
     };

      await onSubmit(updated);
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Failed to update service. Please try again.');
    }
  };

  // For synergy "Add Metric" dropdown
  const [metricDropdown, setMetricDropdown] = useState('');
  const handleAddSynergyMetric = () => {
    if (!metricDropdown) return;
    if (chosenMetrics.includes(metricDropdown)) return;

    let initialValue: any = '';
    if (metricDropdown === 'recyclable') {
      initialValue = false;
    } else if (metricDropdown === 'peerCostEffectiveness') {
      initialValue = 'peer-enabled';
    } else if (metricDropdown === 'materials') {
      initialValue = [];
    } else if (metricDropdown === 'ethicalPractices') {
      initialValue = [];
    } else if (
      ['energyUsage', 'energyProduction', 'waterUsage', 'waterRecycled',
       'carbonEmissions', 'carbonOffsets', 'wasteGenerated', 'wasteRecycled'].includes(metricDropdown)
    ) {
      initialValue = { value: '', unit: '' };
    }

    setChosenMetrics((prev) => [...prev, metricDropdown]);
    setMetrics((prev) => ({ ...prev, [metricDropdown]: initialValue }));
    setMetricDropdown('');
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
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(255,255,255,.7), rgba(255,255,255,0) 60%)',
          }}
        />
      </div>

      <div className="relative flex flex-1">
        {/* Left Column - Edit Service Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="bg-primary bg-opacity-90 text-white p-8 rounded-lg shadow-lg m-4 w-full max-w-lg">
            <h2 className="text-4xl font-bold mb-8 text-center">Edit Service</h2>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleBasicChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={description}
                  onChange={handleBasicChange}
                  required
                  className="mt-1 block w-full text-white bg-transparent border-b border-white
                             focus:border-secondary focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>

              {/* Category */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Categories
                </label>
                <CategorySelect value={categories} onChange={setCategories} />
              </div>

              {/* Service Cost */}
              <div>
                <label className="block text-sm font-medium text-white">Service Cost ($)</label>
                <input
                  type="number"
                  name="serviceCost"
                  value={price}
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

              {/* synergy form */}
              {chosenMetrics.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold">ERS Metrics</h4>
                  {chosenMetrics.map((metricKey) => (
                    <div key={metricKey}>
                      <label className="block text-xs font-medium mb-1">
                        {metricLabel(metricKey)}      {/* ← prettier name */}
                      </label>
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
                    className="btn btn-secondary text-sm font-medium whitespace-nowrap"
                  >
                    Upload Doc
                  </button>
                </div>

                {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}

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
                className="btn btn-secondary w-full mt-4 text-white"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Right side: Info + Photos */}
        <div className="w-1/2 hidden md:flex flex-col items-center justify-center">
          <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg m-4 max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-primary">Update Your Service</h2>
            <p className="mb-4 text-primary">
              Keep your service info up to date. Clients rely on accurate details to choose
              the best eco-friendly solutions.
            </p>
            <ul className="list-disc list-inside mb-4 text-primary">
              <li>Showcase new eco achievements</li>
              <li>Emphasize updated ethical or sustainable practices</li>
              <li>Maintain credibility with verified docs</li>
            </ul>
            <p className="mb-4 text-primary">A current profile stands out in the eco-conscious market.</p>
          </div>

          {/* Photo section */}
          <PhotoPicker
            photos={photos}

            /* permanently delete on server + update state */
            onDelete={async (id) => {
              await handleDeletePhoto(id);
              setPhotos((prev) => prev.filter((p) => p._id !== id));
            }}

            /* upload new files (PhotoPicker passes you File[]) */
            onUpload={handlePhotoUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default EditServiceForm;
