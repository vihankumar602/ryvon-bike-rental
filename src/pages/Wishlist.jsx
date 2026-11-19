import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useWishlist } from '../context/WishlistContext';
import { useModal } from '../context/ModalContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { bikes } from '../data/bikes';
import BikeCard from '../components/bikes/BikeCard';

const STARTER_IDS = ['himalayan', 'activa', 'scrambler400x', 'duke'];

export default function Wishlist() {
  const { wishlist, clearWishlist, toggleWishlist, comparisons } = useWishlist();
  const { openModal } = useModal();
  const { money } = useCurrency();
  const { toast } = useToast();

  const [activeFilter, setActiveFilter] = useState('all');

  const savedBikes = wishlist.map(id => bikes.find(b => b.id === id)).filter(Boolean);
  const starterBikes = STARTER_IDS.map(id => bikes.find(b => b.id === id)).filter(Boolean);

  const filteredBikes = savedBikes.filter(b => {
    if (activeFilter === 'adventure') return b.type === 'Adventure';
    if (activeFilter === 'sport') return b.type === 'Sport' || b.type === 'Roadster';
    if (activeFilter === 'cruiser') return b.type === 'Cruiser';
    if (activeFilter === 'scooter') return b.type === 'Scooter';
    return true;
  });

  const handleCompareClick = () => {
    if (comparisons.length < 2) {
      if (savedBikes.length >= 2) {
        openModal('aiCompare', { bikeA: savedBikes[0], bikeB: savedBikes[1] });
      } else {
        toast('Select two vehicles to compare side-by-side.');
      }
    } else {
      const bA = bikes.find(b => b.id === comparisons[0]) || savedBikes[0];
      const bB = bikes.find(b => b.id === comparisons[1]) || savedBikes[1];
      openModal('aiCompare', { bikeA: bA, bikeB: bB });
    }
  };

  return (
    <DashboardLayout active="wishlist">
      {/* 1. LUXURY PRIVATE GARAGE VAULT HERO BANNER */}
      <div className="garage-header-card profile-header-card card">
        <div className="profile-header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="garage-vault-avatar-wrap">
            <span className="garage-vault-avatar-icon">🏎️</span>
            <span className="garage-vault-radar-pulse" title="Telemetry Live"></span>
          </div>
          <div className="profile-header-info">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '10.5px', fontWeight: 800, border: '1px solid rgba(245,158,11,0.35)', letterSpacing: '0.04em' }}>
                ⚡ RYVON PRIVATE GARAGE VAULT
              </span>
              <span className="badge" style={{ background: 'rgba(16,185,129,0.18)', color: '#10b981', fontSize: '10.5px', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>
                ✓ 24/7 ESCROW RATE-LOCK
              </span>
            </div>
            <h1 style={{ margin: '2px 0 6px 0', fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#ffffff', letterSpacing: '-0.01em' }}>
              Your Garage &amp; Saved Fleet
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
              {savedBikes.length} vehicles shortlisted • Rates locked for instant keyless dispatch.
            </p>
          </div>
        </div>

        {savedBikes.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={handleCompareClick}>
              ⚖️ Compare Head-to-Head (VS)
            </button>
            <button
              className="btn btn-outline btn-sm"
              type="button"
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
              onClick={() => {
                if (window.confirm('Clear all vehicles from your saved garage?')) {
                  clearWishlist();
                  toast('Garage cleared.');
                }
              }}
            >
              Clear Garage
            </button>
          </div>
        )}
      </div>

      {savedBikes.length > 0 ? (
        <div style={{ marginTop: '24px' }}>
          {/* Filter Bar */}
          <div className="riding-style-bar" style={{ marginBottom: '16px' }}>
            <button
              className={`riding-style-chip ${activeFilter === 'all' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('all')}
            >
              All ({savedBikes.length})
            </button>
            <button
              className={`riding-style-chip ${activeFilter === 'adventure' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('adventure')}
            >
              Adventure ({savedBikes.filter(b => b.type === 'Adventure').length})
            </button>
            <button
              className={`riding-style-chip ${activeFilter === 'sport' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('sport')}
            >
              Sport &amp; Roadster ({savedBikes.filter(b => b.type === 'Sport' || b.type === 'Roadster').length})
            </button>
            <button
              className={`riding-style-chip ${activeFilter === 'cruiser' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('cruiser')}
            >
              Cruiser ({savedBikes.filter(b => b.type === 'Cruiser').length})
            </button>
            <button
              className={`riding-style-chip ${activeFilter === 'scooter' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveFilter('scooter')}
            >
              Scooters ({savedBikes.filter(b => b.type === 'Scooter').length})
            </button>
          </div>

          <div className="catalog-grid" id="catalog">
            {filteredBikes.map((bike, idx) => (
              <BikeCard key={bike.id} bike={bike} index={idx} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '24px' }}>
          <div className="card empty-state" style={{ padding: '36px 20px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', marginBottom: '24px' }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🏍️</div>
            <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>Your Garage is Currently Empty</h3>
            <p className="muted" style={{ maxWidth: '420px', margin: '0 auto 18px', fontSize: '13px' }}>
              Add motorcycles to your garage to lock rental rates and compare models side-by-side.
            </p>
            <Link className="btn btn-primary btn-sm" to="/bikes">
              Browse Fleet Catalog →
            </Link>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '14px' }}>
              Recommended Starters for Your Garage
            </h3>
            <div className="catalog-grid" id="catalog">
              {starterBikes.map((bike, idx) => (
                <BikeCard key={bike.id} bike={bike} index={idx} />
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
