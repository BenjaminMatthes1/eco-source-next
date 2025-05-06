'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { calculateUserLevelScore } from '@/services/ersMetricsService';
import CircularScore from '../ui/circularScore';

/** We can define an interface for user synergy: */
interface UserSynergy {
  chosenMetrics: string[];
  metrics: Record<string, any>;
}

/** 
 * If you want to show a few synergy fields or link to them,
 * you can store them here or dynamically pick from userSynergy. 
 * For the summary, let's just show overall synergy score 
 * and a couple of known keys (like totalCarbonFootprint, philanthropicDonations).
 */
interface ERSMetricsSummaryProps {
  userId: string;
}


const ERSMetricsSummary: React.FC<ERSMetricsSummaryProps> = ({ userId }) => {
  // We'll store the synergy data from the user doc:
  const [userSynergy, setUserSynergy] = useState<UserSynergy | null>(null);
  // The synergy-based user score
  const [userScore, setUserScore] = useState<number>(0);
  const [dataStatus, setDataStatus] = useState<string>('OK');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}`);
        const userDoc = response.data.user;
        // if synergy fields exist, set them, else init empty
        if (userDoc.chosenMetrics && userDoc.metrics) {
          setUserSynergy({
            chosenMetrics: userDoc.chosenMetrics,
            metrics: userDoc.metrics,
          });
        } else {
          setUserSynergy({ chosenMetrics: [], metrics: {} });
        }
      } catch (err) {
        console.error('Error fetching user synergy:', err);
        setError('Failed to load user synergy.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMetrics();
    }
  }, [userId]);

  // Whenever userSynergy changes, recalc the synergy-based score
  useEffect(() => {
    if (!userSynergy) return;
    const result = calculateUserLevelScore({
      chosenMetrics: userSynergy.chosenMetrics,
      metrics: userSynergy.metrics,
    });
    setUserScore(result.score);
    setDataStatus(result.dataStatus);
  }, [userSynergy]);

  if (loading) {
    return <p>Loading ERS Metrics...</p>;
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (!userSynergy) {
    return <p>No synergy data found.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-primary">Your ERS Metrics</h2>
      
      {/* Circular ring for synergy userScore */}
      <div className="mb-3">
        <CircularScore score={userScore} />
      </div>
      <strong>
      <p className="text-sm text-black mb-4 ">
        Data Status: <strong>{dataStatus}</strong>
      </p>
      </strong>

      {/* Optionally show a couple synergy fields if we know them. 
          For example, 'totalCarbonFootprint', 'philanthropicDonations' 
          if they exist in chosenMetrics. 
      */}
      <ul className="space-y-2 text-center">
        {userSynergy.chosenMetrics.includes('totalCarbonFootprint') &&
          userSynergy.metrics.totalCarbonFootprint !== undefined && (
            <li>
              <strong>Carbon Footprint:</strong> {userSynergy.metrics.totalCarbonFootprint} kg/yr
            </li>
        )}
        {userSynergy.chosenMetrics.includes('philanthropicDonations') &&
          userSynergy.metrics.philanthropicDonations !== undefined && (
            <li>
              <strong>Donations:</strong> {userSynergy.metrics.philanthropicDonations}%
            </li>
        )}
        {/* add or remove any synergy fields you'd like to preview */}
      </ul>

      <div className="mt-6">
        <Link
          href="/dashboard/metrics/ers-extended"
          className="text-blue-600 hover:underline font-semibold"
        >
          View More Insights
        </Link>
      </div>
    </div>
  );
};

export default ERSMetricsSummary;
