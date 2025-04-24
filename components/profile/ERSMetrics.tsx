'use client';

import React from 'react';

interface IUserERSMetrics {
  economicImpactRating: number;
  additionalEthicalPractices: string[];
  carbonFootprint: number;
  carbonOffsets: number;
  hasSustainabilityPolicy: boolean;
  charitableDonationsPercent: number;
  hasVolunteerPrograms: boolean;
  overallScore: number; // final numeric 0–100
}

interface ERSMetricsProps {
  metrics?: IUserERSMetrics;
}

const ERSMetrics: React.FC<ERSMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold">User ERS Metrics</h2>
        <p>No metrics available for this user.</p>
      </div>
    );
  }

  const {
    economicImpactRating,
    additionalEthicalPractices,
    carbonFootprint,
    carbonOffsets,
    hasSustainabilityPolicy,
    charitableDonationsPercent,
    hasVolunteerPrograms,
    overallScore,
  } = metrics;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold">User ERS Metrics</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>
          <strong>Economic Impact Rating:</strong> {economicImpactRating}/10
        </li>
        <li>
          <strong>Additional Ethical Practices:</strong>{' '}
          {additionalEthicalPractices.length > 0
            ? additionalEthicalPractices.join(', ')
            : 'None'}
        </li>
        <li>
          <strong>Carbon Footprint:</strong> {carbonFootprint} metric tons/yr
        </li>
        <li>
          <strong>Carbon Offsets:</strong> {carbonOffsets} metric tons/yr
        </li>
        <li>
          <strong>Sustainability Policy:</strong>{' '}
          {hasSustainabilityPolicy ? 'Yes' : 'No'}
        </li>
        <li>
          <strong>Charitable Donations:</strong> {charitableDonationsPercent}%
        </li>
        <li>
          <strong>Volunteer Programs:</strong>{' '}
          {hasVolunteerPrograms ? 'Yes' : 'No'}
        </li>
        <li>
          <strong>Overall ERS Score:</strong> {overallScore}/100
        </li>
      </ul>
    </div>
  );
};

export default ERSMetrics;
