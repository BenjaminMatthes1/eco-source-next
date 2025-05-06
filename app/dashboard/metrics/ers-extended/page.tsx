'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import {
  calculateUserLevelScore,
  calculateERSItemScore,
  calculateOverallUserERSScore,
  DynamicInputs,
} from '@/services/ersMetricsService';

import CircularScore from '@/components/profile/CircularScore';
import MetricSelect from '@/components/forms/MetricSelect';
import { dropdownPrimaryWhiteMenu } from '@/utils/selectStyles';


const PRIMARY = '#0B3D2E';
/** 
 * Example user synergy keys 
 * (minus the old "certifications" array approach).
 */
const USER_METRICS_OPTIONS = [
  { key: 'totalCarbonFootprint', label: 'Total Carbon Footprint (kg/yr)' },
  { key: 'carbonOffsets', label: 'Carbon Offsets (kg/yr)' },
  { key: 'totalEnergyConsumption', label: 'Total Energy Consumption (kWh)' },
  { key: 'totalEnergyProduction', label: 'Total Energy Production (kWh)' },
  { key: 'philanthropicDonations', label: 'Philanthropic Donations (%)' },
  { key: 'supplierEthics', label: 'Supplier Ethics (%)' },
  { key: 'volunteerPrograms', label: 'Volunteer Programs' },
  
  // (We assume 'uploadedDocuments' is automatically inserted from the backend.)
];

export const metricLabel = (key: string) =>
  USER_METRICS_OPTIONS.find((m) => m.key === key)?.label ?? key;

/** 
 * For synergy score ring
 */


/** 
 * A small helper interface for user synergy
 */
interface UserSynergy {
  chosenMetrics: string[];
  metrics: Record<string, any>;
}

const ScoreWithLabel: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="flex flex-col items-center">
    <CircularScore score={score} />
    <p className="mt-1 text-sm font-semibold">{label}</p>
  </div>
);

/**
 * A simple component for uploading user documents (like products/services).
 * The synergy function sees them if your backend sets userDoc.metrics["uploadedDocuments"].
 */
function UserDocumentsSection({ userId }: { userId: string }) {
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string>('Other');
  const [error, setError] = useState('');

  
  

  useEffect(() => {
    // On mount, fetch the user => get existing docs
    axios.get(`/api/users/${userId}`)
      .then((res) => {
        // We assume the user doc has an array of user.uploadedDocuments
        const docs = res.data.user.uploadedDocuments || [];
        setUserDocs(docs);
      })
      .catch(() => setError('Failed to load user docs.'));
  }, [userId]);

  async function handleUpload() {
    setError('');
    if (selectedFiles.length === 0) {
      setError('No file selected.');
      return;
    }
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category); // e.g. "Certification", "PolicyDoc", etc.

        const res = await fetch(`/api/users/${userId}/upload-docs`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Upload failed');
        }
        const newDoc = await res.json();
        setUserDocs((prev) => [...prev, newDoc]);
      }
      setSelectedFiles([]);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="mt-8 p-4 border rounded">
      <h3 className="font-bold text-lg mb-2">User Documents</h3>

      {error && <p className="text-red-500">{error}</p>}

      {/* Existing docs */}
      <div className="mb-4">
        {userDocs.map((doc) => (
          <div key={doc._id} className="flex items-center gap-2 mb-1">
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {doc.name}
            </a>
            <span className="text-sm text-gray-600">
              ({doc.category || 'Uncategorized'}){' '}
              {doc.verified ? '[Verified]' : '[Pending]'}
            </span>
          </div>
        ))}
      </div>

      {/* Upload new docs */}
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <input
          type="file"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) {
              setSelectedFiles(Array.from(e.target.files));
            }
          }}
          className="file-input file-input-bordered file-input-primary"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-60 bg-transparent border-b border-white text-white
+            focus:border-secondary focus:outline-none"
        >
          <option value="Other">Other</option>
          <option value="Certification">Certification</option>
          <option value="PolicyDoc">PolicyDoc</option>
          <option value="EcoLabel">EcoLabel</option>
        </select>

        <button onClick={handleUpload} className="btn btn-sm btn-secondary">
          Upload
        </button>
      </div>
    </div>
  );
}

export default function ExtendedERSMetricsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loading / error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // user synergy
  const [userSynergy, setUserSynergy] = useState<UserSynergy | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [userDataStatus, setUserDataStatus] = useState<string>('OK');

  // synergy arrays for product / service
  const [productSynergies, setProductSynergies] = useState<DynamicInputs[]>([]);
  const [serviceSynergies, setServiceSynergies] = useState<DynamicInputs[]>([]);
  const [avgProductScore, setAvgProductScore] = useState<number>(0);
  const [avgServiceScore, setAvgServiceScore] = useState<number>(0);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [overallDataStatus, setOverallDataStatus] = useState<string>('OK');

  // synergy editing
  const [selectedMetric, setSelectedMetric] = useState('');

  // ----------------- On Mount, fetch user, products, services synergy
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    (async () => {
      try {
        const userId = session.user.id;

        // Fetch user synergy
        const userRes = await axios.get(`/api/users/${userId}`);
        const userDoc = userRes.data.user;
        if (userDoc.chosenMetrics && userDoc.metrics) {
          setUserSynergy({
            chosenMetrics: userDoc.chosenMetrics,
            metrics: userDoc.metrics,
          });
        } else {
          setUserSynergy({ chosenMetrics: [], metrics: {} });
        }

        // Fetch products synergy
        const productsRes = await axios.get(`/api/users/${userId}/products`);
        const userProducts = productsRes.data.products || [];
        const productS = userProducts
          .filter((p: any) => p.chosenMetrics && p.metrics)
          .map((p: any) => ({
            chosenMetrics: p.chosenMetrics,
            metrics: p.metrics,
          }));
        setProductSynergies(productS);

        // Fetch services synergy
        const servicesRes = await axios.get(`/api/users/${userId}/services`);
        const userServices = servicesRes.data.services || [];
        const serviceS = userServices
          .filter((s: any) => s.chosenMetrics && s.metrics)
          .map((s: any) => ({
            chosenMetrics: s.chosenMetrics,
            metrics: s.metrics,
          }));
        setServiceSynergies(serviceS);

      } catch (err) {
        console.error('Error loading synergy:', err);
        setError('Failed to load synergy data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [status, session, router]);

  

  // ----------------- Recalc synergy whenever data changes
  useEffect(() => {
    if (!userSynergy) return;

    // user synergy
    const userRes = calculateUserLevelScore({
      chosenMetrics: userSynergy.chosenMetrics,
      metrics: userSynergy.metrics,
    });
    setUserScore(userRes.score);
    setUserDataStatus(userRes.dataStatus);

    // product synergy average
    let productSum = 0, productCount = 0;
    productSynergies.forEach((p) => {
      const r = calculateERSItemScore(p);
      productSum += r.score;
      productCount++;
    });
    const pAvg = productCount > 0 ? (productSum / productCount) : 0;
    setAvgProductScore(Math.round(pAvg));

    // service synergy average
    let serviceSum = 0, serviceCount = 0;
    serviceSynergies.forEach((s) => {
      const r = calculateERSItemScore(s);
      serviceSum += r.score;
      serviceCount++;
    });
    const sAvg = serviceCount > 0 ? (serviceSum / serviceCount) : 0;
    setAvgServiceScore(Math.round(sAvg));

    // overall aggregator
    const allItems = [...productSynergies, ...serviceSynergies];
    const overall = calculateOverallUserERSScore(allItems, {
      chosenMetrics: userSynergy.chosenMetrics,
      metrics: userSynergy.metrics,
    });
    setOverallScore(overall.score);
    setOverallDataStatus(overall.dataStatus);

  }, [userSynergy, productSynergies, serviceSynergies]);

  

  // ----------------- synergy editing for user
  function handleAddMetric() {
    if (!selectedMetric || !userSynergy) return;
    if (userSynergy.chosenMetrics.includes(selectedMetric)) return;

    let initialVal: any = 0;
    if (selectedMetric === 'volunteerPrograms') {
      initialVal = false;
    }
    setUserSynergy((prev) => {
      if (!prev) return null;
      return {
        chosenMetrics: [...prev.chosenMetrics, selectedMetric],
        metrics: { ...prev.metrics, [selectedMetric]: initialVal },
      };
    });
    setSelectedMetric('');
  }

  function handleRemoveMetric(metricKey: string) {
    if (!userSynergy) return;
    setUserSynergy((prev) => {
      if (!prev) return null;
      const newChosen = prev.chosenMetrics.filter((m) => m !== metricKey);
      const newMetrics = { ...prev.metrics };
      delete newMetrics[metricKey];
      return { chosenMetrics: newChosen, metrics: newMetrics };
    });
  }

  function renderMetricInput(metricKey: string) {
    if (!userSynergy) return null;
    const val = userSynergy.metrics[metricKey];

    if (metricKey === 'uploadedDocuments') return null;

    if (typeof val === 'boolean') {
      // e.g. volunteerPrograms
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={val}
            onChange={(e) => {
              const checked = e.target.checked;
              setUserSynergy((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  metrics: { ...prev.metrics, [metricKey]: checked },
                };
              });
            }}
            className="h-4 w-4 accent-secondary"
          />
          <button
            type="button"
            className="text-xs text-red-400 ml-auto"
            onClick={() => handleRemoveMetric(metricKey)}
          >
            Remove
          </button>
        </div>
      );
    }

    // numeric synergy
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={val}
          onChange={(e) => {
            const num = parseFloat(e.target.value) || 0;
            setUserSynergy((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                metrics: { ...prev.metrics, [metricKey]: num },
              };
            });
          }}
          className="flex-1 min-w-[8rem bg-transparent border-b border-white text-white
+            focus:border-secondary focus:outline-none text-sm"
        />
        <button
          type="button"
          className="text-xs text-red-400"
          onClick={() => handleRemoveMetric(metricKey)}
        >
          Remove
        </button>
      </div>
    );
  }

  async function handleSaveUserSynergy(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id || !userSynergy) return;
    setError('');
    try {
      await axios.put(`/api/users/${session.user.id}`, {
        chosenMetrics: userSynergy.chosenMetrics,
        metrics: userSynergy.metrics,
      });
      alert('User synergy saved!');
    } catch (err) {
      console.error('Error saving synergy:', err);
      setError('Failed to save user synergy. Try again later.');
    }
  }

  // ----------------- RENDER ---------------
  if (loading) {
    return (
      <div className="m-6">
        <p>Loading extended metrics...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="m-6 text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  if (!userSynergy) {
    return (
      <div className="m-6">
        <p>No synergy data found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Extended ERS Metrics</h1>

      {/* Score Rings */}
      <div className="flex flex-wrap gap-6 justify-center">
        <ScoreWithLabel label="User Score" score={userScore} />
        <ScoreWithLabel label="Product Avg" score={avgProductScore} />
        <ScoreWithLabel label="Service Avg" score={avgServiceScore} />
        <ScoreWithLabel label="Overall" score={overallScore} />
      </div>
      <p className="text-sm text-gray-600">
        Overall Data Status: <strong>{overallDataStatus}</strong>
      </p>

      {/* Synergy editing for user metrics */}
      <form onSubmit={handleSaveUserSynergy} className="mt-4 space-y-4 bg-neutral/10 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">User-Level Synergy</h2>

        {/* Add user synergy metric */}
        <div>
          <label className="block text-sm font-medium mb-1">+ Add User Metric</label>
          <div className="flex items-center gap-2 font-redditLight">
          <MetricSelect
            value={selectedMetric}
            onChange={setSelectedMetric}
            className="flex-1"
            styles={dropdownPrimaryWhiteMenu}
          />
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={handleAddMetric}
            >
              + Add
            </button>
          </div>
        </div>

        {userSynergy.chosenMetrics.length > 0 && (
          <div className="mt-4 space-y-3 bg-primary/80 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-white">ERS Metrics</h4>
              {userSynergy.chosenMetrics
              .filter(k => k !== 'uploadedDocuments')
              .map((metricKey) => (
                <div key={metricKey}>

                <label className="block text-xs font-medium mb-1 text-white">
                    {metricLabel(metricKey)}
                  </label>
                  {renderMetricInput(metricKey)}
                </div>
              ))}
            </div>
          )}

        <button type="submit" className="btn btn-primary w-full mt-4">
          Save User Synergy
        </button>
      </form>

      {/* The new "User Documents" section -> exactly like product/service doc uploading */}
      {session?.user?.id && (
        <UserDocumentsSection userId={session.user.id} />
      )}
    </div>
  );
}
