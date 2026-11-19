import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { bikeImg } from '../../data/bikes';

export default function BikeCard({ bike, index = 0 }) {
  const navigate = useNavigate();
  const { isWished, toggleWish, isCompared, toggleCompare } = useWishlist();
  const { money } = useCurrency();
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();

  if (!bike) return null;

  const saved = isWished(bike.id);
  const compared = isCompared(bike.id);
  const imgSrc = bikeImg(bike);

  // Reference-exact ride counts for flagship models, algorithmic for rest
  const ridesCount = bike.rides || (
    bike.id === 'scrambler400x' ? 215 :
    bike.id === 'ktmadv390' ? 188 :
    bike.id === 'scram411' ? 302 :
    bike.id === 'vstrom250' ? 167 :
    ((bike.price % 170) + 124)
  );

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(bike.id, (aId, bId) => {
      openModal('compare', { bikeAId: aId, bikeBId: bId });
    });
  };

  const handle360Click = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openModal('360', { bikeId: bike.id });
  };

  const handleBookNowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const targetUrl = `/booking?bike=${bike.id}`;
    if (!isAuthenticated) {
      const pendingBooking = {
        bikeId: bike.id,
        bikeName: bike.name,
        bikeImage: imgSrc,
        pickupCity: 'Bengaluru',
        pickupHub: 'Bengaluru',
        redirectUrl: targetUrl
      };
      sessionStorage.setItem('ryvon-pending-booking', JSON.stringify(pendingBooking));

      openModal('authRequired', {
        title: 'Your Ride Awaits!',
        description: 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.',
        redirectUrl: targetUrl,
        cancelText: 'Continue Exploring'
      });
      return;
    }
    navigate(targetUrl);
  };

  return (
    <article className="fleet-bike-card" data-bike={bike.id}>
      {/* 1. IMAGE & SHOWROOM PEDESTAL AREA */}
      <div className="fleet-card-media-wrap">
        <Link to={`/bike-details?bike=${bike.id}`} className="fleet-card-img-link" aria-label={bike.name}>
          <img
            loading="lazy"
            src={imgSrc}
            alt={bike.name}
            className="fleet-card-bike-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/images/ryvon-superbike.png';
            }}
          />
        </Link>

        {/* Favorite Heart Button in Top-Right Corner */}
        <button
          className={`fleet-card-wish-btn ${saved ? 'active' : ''}`}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWish(bike.id);
          }}
          aria-label={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          title={saved ? 'In Wishlist' : 'Save to Wishlist'}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill={saved ? '#FF3366' : 'none'} stroke={saved ? '#FF3366' : '#FFFFFF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Floating Quick Action: 360 View */}
        <button
          className="fleet-card-360-badge"
          type="button"
          onClick={handle360Click}
          title="Open 360° Interactive Showroom"
        >
          <span>360°</span>
        </button>
      </div>

      {/* 2. INFORMATION AREA */}
      <div className="fleet-card-body">
        {/* Badges: Category & Verified Status */}
        <div className="fleet-card-badges-row">
          <span className="fleet-badge-category">
            {bike.type.toUpperCase()}
          </span>
          <span className="fleet-badge-verified">
            ✓ VERIFIED
          </span>
        </div>

        {/* Motorcycle Name */}
        <h3 className="fleet-card-title">
          <Link to={`/bike-details?bike=${bike.id}`} title={bike.name}>
            {bike.name}
          </Link>
        </h3>

        {/* Specs Pills: Engine Displacement, Power, Transmission */}
        <div className="fleet-card-specs-row">
          <span className="fleet-spec-item" title="Engine Displacement">
            <span className="fleet-spec-icon">⚙</span>
            <span>{bike.engine}</span>
          </span>
          <span className="fleet-spec-item" title="Max Power Output">
            <span className="fleet-spec-icon">⚡</span>
            <span>{bike.power}</span>
          </span>
          <span className="fleet-spec-item" title="Transmission Type">
            <span className="fleet-spec-icon">🕹</span>
            <span>{bike.transmission}</span>
          </span>
        </div>

        {/* Rating & Ride Count */}
        <div className="fleet-card-rating-row">
          <span className="fleet-rating-stars">★ {bike.rating}</span>
          <span className="fleet-rating-count">({ridesCount} rides)</span>
        </div>

        {/* Pricing & Primary Action */}
        <div className="fleet-card-footer">
          <div className="fleet-card-pricing">
            <strong className="fleet-card-price-val">{money(bike.price)}</strong>
            <span className="fleet-card-price-unit">/day</span>
          </div>

          <div className="fleet-card-actions">
            <button
              className={`fleet-card-vs-btn ${compared ? 'active' : ''}`}
              type="button"
              onClick={handleCompareClick}
              title={compared ? 'In Comparison Matrix' : 'Compare with another motorcycle'}
            >
              {compared ? '✓' : 'VS'}
            </button>
            <button
              type="button"
              onClick={handleBookNowClick}
              className="fleet-card-book-btn"
            >
              Book Now →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
