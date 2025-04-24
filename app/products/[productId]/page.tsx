'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Product } from '@/types/types';
import { calculateERSItemScore } from '@/services/ersMetricsService';
import {
  FaArrowLeft,
  FaArrowRight,
  FaWindowClose,
  FaFilePdf,
  FaLeaf,
  FaExclamationTriangle,
  FaFileAlt
} from 'react-icons/fa';
import { metricLabel } from '@/utils/metricOptions';
import mongoose from 'mongoose';

/* pretty-print any metric (same helper we used on services) */
function formatMetric(key: string, val: any) {
  if (val == null) return '—';

  if (val && typeof val === 'object' && 'value' in val && 'unit' in val) {
    return `${val.value} ${val.unit}`;
  }

  if (['packagingRecyclability', 'localSourcing'].includes(key)) {
    return `${val}%`;
  }

  if (typeof val === 'boolean') return val ? 'Yes' : 'No';

  return String(val);
}

/** Icon by doc category */
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

/** Maps 0..100 => 0..120 hue */
function getScoreHue(score: number) {
  const clamped = Math.max(0, Math.min(100, score));
  return (clamped * 120) / 100; // 0=red ->120=green
}

/** Circular ring for an ERS score */
const CircularScore: React.FC<{ score: number }> = ({ score }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const hue = getScoreHue(score);
  const strokeColor = `hsl(${hue}, 100%, 50%)`;

  return (
    <svg className="w-20 h-20" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="10"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy=".3em"
        fontSize="26"
        fontWeight="Black"
        fill={strokeColor}
      >
        {score}%
      </text>
    </svg>
  );
};

const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams();
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewData, setReviewData] = useState({ rating: '', comment: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [ersScore, setErsScore] = useState<number | null>(null);

  // Photo modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Thumbnails
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

  // Track user's existing rating for costEffectiveness & viability
  const [myCostRating, setMyCostRating] = useState<number | null>(null);
  const [myEconRating, setMyEconRating] = useState<number | null>(null);

  // Track whether we show the rating form or the read-only view
  const [showCostForm, setShowCostForm] = useState(true);
  const [showEconForm, setShowEconForm] = useState(true);

  // The user’s new rating input (for updating)
  const [costRating, setCostRating] = useState('');
  const [econRating, setEconRating] = useState('');
  const [peerError, setPeerError] = useState('');

  /** Submit a peer rating for the given metric. */
  async function handlePeerRatingSubmit(metric: 'costEffectiveness' | 'economicViability') {
    setPeerError('');
    const ratingValue = metric === 'costEffectiveness' ? costRating : econRating;
    const numeric = parseInt(ratingValue, 10);
    if (isNaN(numeric) || numeric < 1 || numeric > 10) {
      setPeerError('Rating must be between 1 and 10.');
      return;
    }

    try {
      const res = await axios.post(`/api/products/${productId}/peer-ratings`, {
        metric,
        rating: numeric,
      });
      const updatedProduct: Product = res.data.product;
      setProduct(updatedProduct);

      // Recalc synergy
      if (updatedProduct.chosenMetrics && updatedProduct.metrics) {
        const synergyResult = calculateERSItemScore({
          chosenMetrics: updatedProduct.chosenMetrics,
          metrics: updatedProduct.metrics,
        });
        setErsScore(synergyResult.score);
      }

      // Now figure out the user's rating from the updated product
      if (metric === 'costEffectiveness') {
        const entry = updatedProduct.peerRatings?.costEffectiveness.find(
          (r) => r.userId.toString() === session?.user?.id
        );
        setMyCostRating(entry?.rating ?? null);
        setShowCostForm(false); // done editing
        setCostRating('');      // reset
      } else {
        const entry = updatedProduct.peerRatings?.economicViability.find(
          (r) => r.userId.toString() === session?.user?.id
        );
        setMyEconRating(entry?.rating ?? null);
        setShowEconForm(false);
        setEconRating('');
      }
    } catch (err) {
      console.error('Peer rating error:', err);
      setPeerError('Failed to submit rating. Please try again.');
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
        const fetchedProduct: Product = response.data.product;
        setProduct(fetchedProduct);
        setReviews(fetchedProduct.reviews || []);

        // synergy
        if (fetchedProduct.chosenMetrics && fetchedProduct.metrics) {
          const synergyResult = calculateERSItemScore({
            chosenMetrics: fetchedProduct.chosenMetrics,
            metrics: fetchedProduct.metrics,
          });
          setErsScore(synergyResult.score);
        } else {
          setErsScore(null);
        }

        // find existing peer rating for current user
        if (fetchedProduct.peerRatings) {
          const costEntry = fetchedProduct.peerRatings.costEffectiveness.find(
            (r) => r.userId.toString() === session?.user?.id
          );
          const viabilityEntry = fetchedProduct.peerRatings.economicViability.find(
            (r) => r.userId.toString() === session?.user?.id
          );

          setMyCostRating(costEntry ? costEntry.rating : null);
          setShowCostForm(!costEntry); // if they have a rating, hide form

          setMyEconRating(viabilityEntry ? viabilityEntry.rating : null);
          setShowEconForm(!viabilityEntry);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, session?.user?.id]);

  // Photo modal
  const openMainPhotoModal = () => {
    setCurrentPhotoIndex(activePhotoIndex);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const showPrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?.photos) return;
    setCurrentPhotoIndex((prev) => (prev === 0 ? product.photos.length - 1 : prev - 1));
  };
  const showNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?.photos) return;
    setCurrentPhotoIndex((prev) =>
      prev === product.photos.length - 1 ? 0 : prev + 1
    );
  };

  // Reviews
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`/api/products/${productId}/reviews`, reviewData);
      setReviewData({ rating: '', comment: '' });

      // re-fetch product
      const updatedRes = await axios.get(`/api/products/${productId}`);
      const updatedProd: Product = updatedRes.data.product;
      setProduct(updatedProd);
      setReviews(updatedProd.reviews || []);
    } catch (err) {
      console.error('Review submit error:', err);
      setError('Error submitting review. Please try again.');
    }
  };

  if (loading) return <p className="m-6 animate-in fade-in">Loading Product...</p>;
  if (!product) {
    return (
      <p className="m-6 text-red-500 animate-in fade-in">
        Product not found.
      </p>
    );
  }

  // Ownership check
  const actualUserId = typeof product.userId === 'object' ? product.userId._id : product.userId;
  const isOwner = session?.user?.id === actualUserId;

  // For user display
  const userName =
    typeof product.userId === 'object' && product.userId?.name
      ? product.userId.name
      : 'Unknown Seller';
  const userAvatar =
    typeof product.userId === 'object' && product.userId?.profilePictureUrl
      ? product.userId.profilePictureUrl
      : '/images/default-profile.jpg';

  // Main photo
  const mainPhoto = product.photos && product.photos.length > 0
    ? product.photos[activePhotoIndex]
    : null;

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-neutral via-neutral/90 to-accent/60 animate-in fade-in">
      {/* Container */}
      <section
        className="grid grid-cols-[0.9fr_1fr] max-w-7xl mx-auto bg-white rounded shadow-lg relative p-6 animate-in fade-in gap-8"
      >
        {/* Left Photo section */}
        <div className="relative">
          <div className="absolute grid grid-rows-[auto_1fr] rounded shadow-md overflow-hidden inset-0">
            <div className="relative p-4 bg-gradient-to-br from-primary to-secondary">
              {/* Seller Info */}
              <div className="flex items-center gap-3">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <p className="text-white text-md">{userName}</p>
              </div>
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

            {/* Thumbnail carousel */}
            {product.photos && product.photos.length > 1 && (
              <div className="bg-white p-2 mt-6 mb-6 relative">
                {product.photos.length > 3 && (
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
                <div ref={thumbnailRef} className="flex gap-2 overflow-x-hidden scroll-smooth pl-8 pr-8">
                  {product.photos.map((photo, idx) => (
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
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="text-2xl text-secondary font-bold mb-4">
            {product.price ? `$${product.price.toFixed(2)}` : 'No set price'}
          </div>

          {/* Description + Category */}
          <div className="mb-4">
            <p className="font-helveticaThinItalic text-md text-gray-600 mb-2">
              <strong>Category:</strong>{' '}
              {product.categories && product.categories.join(', ') || 'N/A'}
            </p>
            <p className="text-base text-gray-800">{product.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6">
            {isOwner ? (
              <Link href={`/products/${productId}/edit`}>
                <button className="btn btn-secondary text-white">
                  Edit Product
                </button>
              </Link>
            ) : (
              <Link href={`/messages/${actualUserId}`}>
                <button className="btn btn-primary text-white">
                  Message Seller
                </button>
              </Link>
            )}
          </div>

          {/* ERS Score */}
          {ersScore !== null && (
            <div className="mb-4 flex items-center gap-4 bg-neutral p-2 justify-center rounded-md">
              <CircularScore score={ersScore} />
              <span className="text-secondary text-xl font-bold">
                Product ERS Score
              </span>
            </div>
          )}

          {/* SYNERGY FIELDS */}
          {product.chosenMetrics && product.metrics && (
            <div className="space-y-2 text-md text-primary font-semibold">
              {/* MATERIALS */}
              {product.chosenMetrics.includes('materials') && Array.isArray(product.metrics.materials) && (
                <p>
                  <strong>Materials:</strong>{' '}
                  {product.metrics.materials
                    .map((m: any) =>
                      `${m.name} (${m.percentageRecycled}% recycled, isRenewable=${m.isRenewable})`
                    )
                    .join(', ')}
                </p>
              )}
              
              {/* ── NEW DYNAMIC LIST  ───────────────────────────── */}
                {product.chosenMetrics
                  .filter((k) =>
                    !['materials', 'costEffectiveness', 'economicViability'].includes(k)
                  )
                  .map((metricKey) => (
                    <p key={metricKey}>
                      <strong>{metricLabel(metricKey)}:</strong>{' '}
                      {formatMetric(metricKey, product.metrics[metricKey])}
                    </p>
                ))}
              

              {/* ── Peer Cost-Effectiveness ───────────────────── */}
              {product.chosenMetrics.includes('costEffectiveness') && (
                isOwner ? (
                  product.metrics.costEffectiveness &&
                  typeof product.metrics.costEffectiveness === 'object' && (
                    <div className="p-4 border rounded mt-4 bg-white">
                      <h3 className="font-bold mb-2">Cost-Effectiveness (peer average)</h3>
                      <p>
                        {product.metrics.costEffectiveness.average.toFixed(1)}/10&nbsp;
                        <span className="text-sm text-gray-500">
                          (based on {product.metrics.costEffectiveness.count} ratings)
                        </span>
                      </p>
                    </div>
                  )
                ) : (
                  <div className="p-4 border rounded mt-4 bg-white">
                    <h3 className="font-bold mb-2">Peer Cost-Effectiveness Rating (1–10)</h3>
                    {myCostRating !== null && !showCostForm ? (
                      <>
                        <p>Your rating: {myCostRating}/10</p>
                        {product.metrics.costEffectiveness &&
                          typeof product.metrics.costEffectiveness === 'object' && (
                            <p>
                              Overall average: {product.metrics.costEffectiveness.average.toFixed(1)}/10
                              (count: {product.metrics.costEffectiveness.count})
                            </p>
                        )}
                        <button onClick={() => setShowCostForm(true)} className="btn btn-xs btn-accent mt-2">
                          Change Rating
                        </button>
                      </>
                    ) : (
                      <>
                        <label htmlFor="costRating" className="block text-sm">Rate (1–10):</label>
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
              {product.chosenMetrics.includes('economicViability') && (
                isOwner ? (
                  product.metrics.economicViability &&
                  typeof product.metrics.economicViability === 'object' && (
                    <div className="p-4 border rounded mt-4 bg-white">
                      <h3 className="font-bold mb-2">Economic Viability (peer average)</h3>
                      <p>
                        {product.metrics.economicViability.average.toFixed(1)}/10&nbsp;
                        <span className="text-sm text-gray-500">
                          (based on {product.metrics.economicViability.count} ratings)
                        </span>
                      </p>
                    </div>
                  )
                ) : (
                  <div className="p-4 border rounded mt-4 bg-white">
                    <h3 className="font-bold mb-2">Peer Economic Viability Rating (1–10)</h3>
                    {myEconRating !== null && !showEconForm ? (
                      <>
                        <p>Your rating: {myEconRating}/10</p>
                        {product.metrics.economicViability &&
                          typeof product.metrics.economicViability === 'object' && (
                            <p>
                              Overall average: {product.metrics.economicViability.average.toFixed(1)}/10
                              (count: {product.metrics.economicViability.count})
                            </p>
                        )}
                        <button onClick={() => setShowEconForm(true)} className="btn btn-xs btn-accent mt-2">
                          Change Rating
                        </button>
                      </>
                    ) : (
                      <>
                        <label htmlFor="econRating" className="block text-sm">Rate (1–10):</label>
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
        {/* Documents Section */}
        {/* (unchanged) */}

        {/* Reviews */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Reviews</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-md">
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
      {modalOpen && product.photos && (
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
              src={product.photos[currentPhotoIndex].url}
              alt={
                product.photos[currentPhotoIndex].name || 'Enlarged Product Photo'
              }
              className="object-contain w-full max-h-[80vh] rounded"
            />
            {product.photos.length > 1 && (
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

export default ProductDetailsPage;
