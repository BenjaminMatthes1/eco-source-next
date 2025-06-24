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
import mongoose from 'mongoose';
import ProductERSPanel from '@/components/forms/products/ProductERSPanel';
import { StarsInput } from '@/components/ui/Stars';
import Loading from '@/components/ui/Loading'
import ReviewSection from '@/components/reviews/ReviewSection';



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

const StarRating: React.FC<{ value: number }> = ({ value }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆{/* half icon */}</span>;
        return <span key={i}>☆</span>;
      })}
    </div>
  );
};

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

       

const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams() as { productId?: string };
  if (!productId) {
      return <p className="p-6 text-red-500">Invalid product id.</p>;
    }
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


  if (loading) {
  return <Loading />;
}
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
  const alreadyReviewed = reviews.some(r => r.userId === session?.user?.id);

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
        className="grid grid-cols-[0.9fr_1fr] max-w-7xl mx-auto bg-white rounded shadow-lg p-6 gap-8
              min-h-[580px] overflow-visible"
      >
        {/* Left Photo section */}
        <div className="relative">
          <div className="grid grid-rows-[auto_1fr] rounded shadow-md overflow-hidden h-full">
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
          <div className="mb-4 font-redditLightItalic">
            <p className="text-md text-gray-600 mb-2">
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
        </div>
      </section>

      {/* === ERS metrics + Documents side‑by‑side === */}
      <div className="max-w-7xl mx-auto mt-8 px-4 grid gap-8 md:grid-cols-3 items-center">
        {/* ERS panel ⅔ */}
        <div className="md:col-span-2 w-full">
          <ProductERSPanel
            productId={String(productId)}
            isOwner={isOwner}
            chosen={product.chosenMetrics}
            metrics={product.metrics}
            peerRatings={product.peerRatings}
            userId={session?.user?.id}
          />
        </div>

      {/* ----- right: Documents ----- */}
      <div className="md:col-span-1">
          <h2 className="text-2xl font-bold mb-4 text-primary">Documents</h2>
          {product.uploadedDocuments && product.uploadedDocuments.length > 0 ? (
            <ul className="space-y-2">
              {product.uploadedDocuments.map((doc, idx) => {
                let statusText = 'Pending';
                let statusColor = 'text-yellow-700';
                let isRejected  = false;

                if (doc.verified) {
                  statusText  = 'Verified';
                  statusColor = 'text-green-700';
                } else if (doc.rejectionReason) {
                  statusText  = 'Rejected';
                  statusColor = 'text-red-700';
                  isRejected  = true;
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
      </div>

        {/* Reviews */}
         <ReviewSection
          itemType="product"
          itemId={String(productId)}
          initial={reviews}
          isOwner={isOwner}
        />
        
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
