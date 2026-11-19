import React from 'react';
import { useModal } from '../../context/ModalContext';
import { getBikeImage } from '../../data/bikes';
import WhyThisBike from '../bikes/WhyThisBike';
import { Link } from 'react-router-dom';

export default function WhyThisBikeModal({ bike }) {
  const { closeModal } = useModal();
  if (!bike) return null;
  const imgSrc = getBikeImage(bike);

  return (
    <div className="modal" style={{ width: 'min(580px, 94vw)' }}>
      <button className="icon-btn modal-close" onClick={closeModal} aria-label="Close">✕</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <img
          src={imgSrc}
          width="70"
          height="50"
          alt={bike.name}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
        />
        <div>
          <span className="badge ghost">{bike.type}</span>
          <h2 style={{ margin: '2px 0' }}>{bike.name}</h2>
        </div>
      </div>

      <WhyThisBike bike={bike} />

      <Link
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '14px', textAlign: 'center' }}
        to={`/booking?bike=${bike.id}`}
        onClick={closeModal}
      >
        Reserve {bike.name} →
      </Link>
    </div>
  );
}
