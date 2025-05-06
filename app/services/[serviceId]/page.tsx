'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import mongoose from 'mongoose';
import CircularScore from '@/components/ui/circularScore';

import { Service } from '@/types/types';
import { calculateERSItemScore } from '@/services/ersMetricsService'; 
import { metricLabel } from '@/utils/metricOptions';
import MetricCard from '@/components/ui/metricCard';
// or your synergy approach if you prefer "calculateERSServiceScore"

/** Icon for doc category */
import {
  FaArrowLeft,
  FaArrowRight,
  FaWindowClose,
  FaFilePdf,
  FaLeaf,
  FaExclamationTriangle,
  FaFileAlt
} from 'react-icons/fa';

type PeerMetric =
  | { average: number; count: number }   // what you expect after ratings
  | unknown;                            // any other placeholder

function fmtPeer(metric: PeerMetric) {
  if (
    metric &&                           // not null / undefined
    typeof metric === 'object' &&
    'average' in metric &&
    typeof (metric as any).average === 'number'
  ) {
    const m = metric as { average: number; count: number };
    return `${m.average.toFixed(1)}/10 ( ${m.count} )`;
  }
  return '—/10 (0)';                    // fallback when no ratings yet
}


/* pretty‑print any metric */
function formatMetric(key: string, val: any) {
  if (val == null) return '—';

  // { value, unit } → "10 kWh"
  if (val && typeof val === 'object' && 'value' in val && 'unit' in val) {
    return `${val.value} ${val.unit}`;
  }

  // percentage‑based keys
  if (['packagingRecyclability', 'localSourcing'].includes(key)) {
    return `${val}%`;
  }

  // boolean
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';

  return String(val);
}

/** Convert 0..100 to hue 0..120 (red->green) */
function getScoreHue(score: number) {
  const clamped = Math.max(0, Math.min(100, score));
  return (clamped * 120) / 100; 
}


/** Get doc icon by category */
function getDocumentIcon(category: string | undefined) {
  switch (category) {
    case 'FairTradeCert':
      return <FaLeaf className="text-2xl" />;
    case 'LCADocument':
      return <FaFilePdf className="text-2xl" />;
    case 'MSDS':
      return <FaExclamationTriangle className="text-2xl" />;
    case 'EcoLabel':
      return <FaLeaf className="text-2xl" />;
    default:
      return <FaFileAlt className="text-2xl" />;
  }
}

const ServiceDetailsPage: React.FC = () => {
  const { serviceId } = useParams();
  const { data: session } = useSession();

  // The service object from DB
  const [service, setService] = useState<Service | null>(null);
  // Basic loading/error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // synergy-based ERS
  const [ersScore, setErsScore] = useState<number | null>(null);

  // Photo modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // For peer rating forms
  const [myCostRating, setMyCostRating] = useState<number | null>(null);
  const [showCostForm, setShowCostForm] = useState(true);
  const [costRating, setCostRating] = useState('');

  const [myEconRating, setMyEconRating] = useState<number | null>(null);
  const [showEconForm, setShowEconForm] = useState(true);
  const [econRating, setEconRating] = useState('');

  const [peerError, setPeerError] = useState('');

  // If your service also has reviews:
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewData, setReviewData] = useState({ rating: '', comment: '' });

  // For the thumbnail carousel
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const scrollThumbnailsLeft = () => {
    if (thumbnailRef.current) {
      thumbnailRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  const scrollThumbnailsRight = () => {
    if (thumbnailRef.current) {
      thumbnailRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // On mount: fetch the service
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/api/services/${serviceId}`);
        const fetchedService: Service = response.data.service;
        setService(fetchedService);
        setReviews(fetchedService.reviews || []);

        // synergy-based approach
        if (fetchedService.chosenMetrics && fetchedService.metrics) {
          const synergy = calculateERSItemScore({
            chosenMetrics: fetchedService.chosenMetrics,
            metrics: fetchedService.metrics,
          });
          setErsScore(synergy.score);
        } else {
          setErsScore(null);
        }

        // existing peer ratings for cost/econ if any
        if (fetchedService.peerRatings) {
          // cost
          const costEntry = fetchedService.peerRatings.costEffectiveness.find(
            (r) => r.userId.toString() === session?.user?.id
          );
          setMyCostRating(costEntry ? costEntry.rating : null);
          setShowCostForm(!costEntry);

          // econ
          const econEntry = fetchedService.peerRatings.economicViability.find(
            (r) => r.userId.toString() === session?.user?.id
          );
          setMyEconRating(econEntry ? econEntry.rating : null);
          setShowEconForm(!econEntry);
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, session?.user?.id]);

  // Submit a peer rating for cost or viability
  async function handlePeerRatingSubmit(metric: 'costEffectiveness' | 'economicViability') {
    setPeerError('');
    const ratingValue = metric === 'costEffectiveness' ? costRating : econRating;
    const numeric = parseInt(ratingValue, 10);
    if (isNaN(numeric) || numeric < 1 || numeric > 10) {
      setPeerError('Rating must be between 1 and 10.');
      return;
    }

    try {
      const res = await axios.post(`/api/services/${serviceId}/peer-ratings`, {
        metric,
        rating: numeric,
      });
      const updated: Service = res.data.service;
      setService(updated);

      // re-run synergy calc
      if (updated.chosenMetrics && updated.metrics) {
        const synergy = calculateERSItemScore({
          chosenMetrics: updated.chosenMetrics,
          metrics: updated.metrics,
        });
        setErsScore(synergy.score);
      }

      // find newly updated rating
      if (metric === 'costEffectiveness') {
        const costEntry = updated.peerRatings.costEffectiveness.find(
          (r) => r.userId.toString() === session?.user?.id
        );
        setMyCostRating(costEntry ? costEntry.rating : null);
        setShowCostForm(false);
        setCostRating('');
      } else {
        const econEntry = updated.peerRatings.economicViability.find(
          (r) => r.userId.toString() === session?.user?.id
        );
        setMyEconRating(econEntry ? econEntry.rating : null);
        setShowEconForm(false);
        setEconRating('');
      }
    } catch (err) {
      console.error('Error rating service:', err);
      setPeerError('Failed to submit rating. Please try again.');
    }
  }

  // For reviews
  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`/api/services/${serviceId}/reviews`, reviewData);
      setReviewData({ rating: '', comment: '' });

      // re-fetch
      const updatedRes = await axios.get(`/api/services/${serviceId}`);
      const updatedSrv = updatedRes.data.service as Service;
      setService(updatedSrv);
      setReviews(updatedSrv.reviews || []);
    } catch (err) {
      console.error('Review submit error:', err);
      setError('Error submitting review. Please try again.');
    }
  }

  // Photo modal logic
  const openMainPhotoModal = () => {
    setCurrentPhotoIndex(activePhotoIndex);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const showPrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!service?.photos) return;
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? service.photos.length - 1 : prev - 1
    );
  };
  const showNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!service?.photos) return;
    setCurrentPhotoIndex((prev) =>
      prev === service.photos.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) return <p className="m-6">Loading Service...</p>;
  if (!service) return <p className="m-6 text-red-500">Service not found.</p>;

  // owner check
  const actualUserId =
    typeof service.userId === 'object' ? service.userId._id : service.userId;
  const isOwner = session?.user?.id === actualUserId;

  // user display
  const userName =
    typeof service.userId === 'object' && service.userId?.name
      ? service.userId.name
      : 'Unknown Seller';
  const userAvatar =
    typeof service.userId === 'object' && service.userId?.profilePictureUrl
      ? service.userId.profilePictureUrl
      : '/images/default-profile.jpg';

  // main photo
  const mainPhoto =
    service.photos && service.photos.length > 0
      ? service.photos[activePhotoIndex]
      : null;

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-neutral via-neutral/90 to-accent/60 animate-in fade-in">
      {/* 2-col container */}
      <section
        className="grid grid-cols-[0.9fr_1fr] max-w-7xl mx-auto bg-white rounded shadow-lg relative p-6 gap-8"
      >
        {/* Left Photo section */}
        <div className="relative">
          <div className="absolute grid grid-rows-[auto_1fr] rounded shadow-md overflow-hidden inset-0">
            <div className="relative p-4 bg-gradient-to-br from-primary to-secondary">
              {/* Seller info */}
              <div className="flex items-center gap-3">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <p className="text-white text-md">{userName}</p>
              </div>
              {/* main photo */}
              <div className="mt-2 flex items-center justify-center">
                {mainPhoto ? (
                  <img
                    src={mainPhoto.url}
                    alt={mainPhoto.name || 'Main Photo'}
                    className="max-w-[120%] max-h-[350px] object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer w-auto rounded-md"
                    onClick={openMainPhotoModal}
                  />
                ) : (
                  <img
                    src="/images/default-product.jpg"
                    alt="Default"
                    className="max-w-[110%] drop-shadow-xl"
                  />
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {service.photos && service.photos.length > 1 && (
              <div className="bg-white p-2 mt-6 mb-6 relative">
                {service.photos.length > 3 && (
                  <>
                    <button
                      onClick={scrollThumbnailsLeft}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-300 bg-opacity-80 text-gray-800 p-1 rounded-full hover:bg-gray-400 z-10"
                    >
                      <FaArrowLeft />
                    </button>
                    <button
                      onClick={scrollThumbnailsRight}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-300 bg-opacity-80 text-gray-800 p-1 rounded-full hover:bg-gray-400 z-10"
                    >
                      <FaArrowRight />
                    </button>
                  </>
                )}
                <div
                  ref={thumbnailRef}
                  className="flex gap-2 overflow-x-hidden scroll-smooth pl-8 pr-8"
                >
                  {service.photos.map((photo, idx) => (
                    <div
                      key={photo._id}
                      className={`
                        min-w-[3rem] h-16 border rounded-md overflow-hidden cursor-pointer hover:border-gray-600 transition duration-200 flex-shrink-0 
                        ${idx === activePhotoIndex ? 'border-secondary' : 'border-gray-300'}
                      `}
                      onClick={() => setActivePhotoIndex(idx)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.name || `Photo ${idx}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Info column */}
        <div className="flex flex-col px-4 py-2 z-10">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {service.name}
            </h1>
          </div>

          {/* service cost */}
          <div className="text-2xl text-secondary font-bold mb-4">
            {service.price ? `$${service.price.toFixed(2)}` : 'No set cost'}
          </div>

          {/* Description + Category */}
          <div className="mb-4">
            <p className="font-helveticaThinItalic text-md text-gray-600 mb-2">
              <strong>Category:</strong> {service.categories}
            </p>
            <p className="text-base text-gray-800">
              {service.description}
            </p>
          </div>

          {/* Buttons */}
          <div className="mb-6">
            {isOwner ? (
              <Link href={`/services/${serviceId}/edit`}>
                <button className="btn btn-secondary text-white">Edit Service</button>
              </Link>
            ) : (
              <Link href={`/messages/${actualUserId}`}>
                <button className="btn btn-primary text-white">Message Seller</button>
              </Link>
            )}
          </div>

          {/* synergy-based ERS score */}
          {ersScore !== null && (
            <div className="mb-4 flex items-center gap-4 bg-neutral p-2 justify-center rounded-md">
              <CircularScore score={ersScore} />
              <span className="text-secondary text-xl font-bold">
                Service ERS Score
              </span>
            </div>
          )}

          {/* synergy fields snippet */}
          {service.chosenMetrics && service.metrics && (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {/* Materials handled first so it appears in order */}
              {service.chosenMetrics.includes('materials') &&
                Array.isArray(service.metrics.materials) && (
                  <MetricCard
                    label="Materials"
                    value={service.metrics.materials
                      .map((m: any) =>
                        `${m.name} (${m.percentageRecycled}% recycled, renewable = ${m.isRenewable})`
                      )
                      .join(', ')}
                  />
              )}

              {/* generic → every metric except the ones we special-case above/below */}
              {service.chosenMetrics
                .filter((k) =>
                  !['materials', 'costEffectiveness', 'economicViability'].includes(k)
                )
                .map((metricKey) => (
                  <MetricCard
                    key={metricKey}
                    label={metricLabel(metricKey)}
                    value={
                      typeof service.metrics[metricKey] === 'object'
                        ? JSON.stringify(service.metrics[metricKey])
                        : String(service.metrics[metricKey])
                    }
                    /* placeholder: later you can pass an extended description here */
                  />
              ) 
          )}
              {/* etc. for any synergy keys. */}
              
              {/* ── Peer Cost‑Effectiveness ───────────────────── */}
                {service.chosenMetrics.includes('costEffectiveness') && (
                    isOwner ? (
                      /* OWNER sees only the current average */
                      <div className="p-4 border rounded mt-4 bg-white">
                        <h3 className="font-bold mb-2">Cost‑Effectiveness (peer average)</h3>
                        <p>{fmtPeer(service.metrics.costEffectiveness as PeerMetric)}</p>
                      </div>
                    ) : (
                      /* NON‑owner can rate or view their rating */
                      <div className="p-4 border rounded mt-4 bg-white">
                        <h3 className="font-bold mb-2">Peer Cost‑Effectiveness Rating (1–10)</h3>

                        {myCostRating !== null && !showCostForm ? (
                          <>
                            <p>Your rating: {myCostRating}/10</p>
                            <p>
                              Overall average: {service.metrics.costEffectiveness.average.toFixed(1)}/10&nbsp;
                              (count: {service.metrics.costEffectiveness.count})
                            </p>
                            <button
                              onClick={() => setShowCostForm(true)}
                              className="btn btn-xs btn-accent mt-2"
                            >
                              Change Rating
                            </button>
                          </>
                        ) : (
                          <>
                            <label htmlFor="costRating" className="block text-sm">Rate (1–10):</label>
                            <input
                              id="costRating"
                              type="number"
                              min={1}
                              max={10}
                              value={costRating}
                              onChange={(e) => setCostRating(e.target.value)}
                              className="border p-1 w-16 mr-2"
                            />
                            <button
                              onClick={() => handlePeerRatingSubmit('costEffectiveness')}
                              className="btn btn-sm btn-secondary"
                            >
                              Submit
                            </button>
                            {peerError && <p className="text-red-500">{peerError}</p>}
                          </>
                        )}
                      </div>
                    )
                )}


              {/* ── Peer Economic Viability ───────────────────── */}
                {service.chosenMetrics.includes('economicViability') && (
                    isOwner ? (
                      <div className="p-4 border rounded mt-4 bg-white">
                        <h3 className="font-bold mb-2">Economic Viability (peer average)</h3>
                        <p>{fmtPeer(service.metrics.costEffectiveness as PeerMetric)}</p>
                      </div>
                    ) : (
                      <div className="p-4 border rounded mt-4 bg-white">
                        <h3 className="font-bold mb-2">Peer Economic Viability Rating (1–10)</h3>

                        {myEconRating !== null && !showEconForm ? (
                          <>
                            <p>Your rating: {myEconRating}/10</p>
                            <p>
                              Overall average: {service.metrics.economicViability.average.toFixed(1)}/10&nbsp;
                              (count: {service.metrics.economicViability.count})
                            </p>
                            <button
                              onClick={() => setShowEconForm(true)}
                              className="btn btn-xs btn-accent mt-2"
                            >
                              Change Rating
                            </button>
                          </>
                        ) : (
                          <>
                            <label htmlFor="econRating" className="block text-sm">Rate (1–10):</label>
                            <input
                              id="econRating"
                              type="number"
                              min={1}
                              max={10}
                              value={econRating}
                              onChange={(e) => setEconRating(e.target.value)}
                              className="border p-1 w-16 mr-2"
                            />
                            <button
                              onClick={() => handlePeerRatingSubmit('economicViability')}
                              className="btn btn-sm btn-secondary"
                            >
                              Submit
                            </button>
                            {peerError && <p className="text-red-500">{peerError}</p>}
                          </>
                        )}
                      </div>
                    )
                )}
            </div>
          )}
        </div>
      </section>

      {/* Documents & Reviews below */}
      <div className="max-w-5xl mx-auto mt-6 px-4 animate-in fade-in">
        {/* Documents */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">Documents</h2>
          {service.uploadedDocuments && service.uploadedDocuments.length > 0 ? (
            <ul className="space-y-2">
              {service.uploadedDocuments.map((doc, idx) => {
                let statusText = 'Pending';
                let statusColor = 'text-yellow-700';
                let isRejected = false;

                if (doc.verified) {
                  statusText = 'Verified';
                  statusColor = 'text-green-700';
                } else if (doc.rejectionReason) {
                  statusText = 'Rejected';
                  statusColor = 'text-red-700';
                  isRejected = true;
                }

                return (
                  <li
                    key={idx}
                    className="border rounded p-2 flex items-center gap-3 bg-white"
                  >
                    {getDocumentIcon(doc.category)}
                    <div className="flex-1">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold hover:underline"
                      >
                        {doc.name}
                      </a>
                      <p className={`${statusColor} text-sm`}>
                        <strong>Status:</strong> {statusText}
                      </p>
                      {isRejected && (
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {doc.rejectionReason}
                        </p>
                      )}
                      {doc.category && (
                        <p className="text-sm text-gray-700">
                          <strong>Category:</strong> {doc.category}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-700">No documents uploaded yet.</p>
          )}
        </div>

        {/* Reviews */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Reviews</h2>
          <form
            onSubmit={handleReviewSubmit}
            className="space-y-4 max-w-md"
          >
            <div>
              <label htmlFor="rating" className="block text-sm font-medium">
                Rating (1-5)
              </label>
              <input
                type="number"
                id="rating"
                value={reviewData.rating}
                onChange={(e) =>
                  setReviewData({ ...reviewData, rating: e.target.value })
                }
                min="1"
                max="5"
                className="w-full border p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium">
                Comment
              </label>
              <textarea
                id="comment"
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                className="w-full border p-2"
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Submit Review
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}

          <div className="space-y-4 mt-6">
            {reviews.map((review) => (
              <div key={review._id} className="border p-4 rounded bg-gray-50">
                <p>
                  <strong>Rating:</strong> {review.rating} / 5
                </p>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PHOTO MODAL */}
      {modalOpen && service.photos && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={closeModal}
            >
              <FaWindowClose />
            </button>
            <img
              src={service.photos[currentPhotoIndex].url}
              alt={
                service.photos[currentPhotoIndex].name || 'Enlarged Service Photo'
              }
              className="object-contain w-full max-h-[80vh] rounded"
            />
            {service.photos.length > 1 && (
              <>
                <button
                  onClick={showPrevPhoto}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={showNextPhoto}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                >
                  <FaArrowRight />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailsPage;
