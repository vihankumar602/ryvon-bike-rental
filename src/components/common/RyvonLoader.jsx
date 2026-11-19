import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function RyvonLoader() {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/index.html';
  const labelText = 'LOADING';

  const [status, setStatus] = useState('active'); // 'active' | 'fading' | 'hidden'
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const minActiveTime = isHome ? 2200 : 1700;
  const fadeDuration = isHome ? 600 : 500;

  useEffect(() => {
    // Only run on initial application load
    if (hasLoadedRef.current) {
      setStatus('hidden');
      return;
    }

    timerRef.current = setTimeout(() => {
      setStatus('fading');
      fadeTimerRef.current = setTimeout(() => {
        setStatus('hidden');
        hasLoadedRef.current = true;
      }, fadeDuration);
    }, minActiveTime);

    safetyTimerRef.current = setTimeout(() => {
      setStatus('hidden');
      hasLoadedRef.current = true;
    }, 3500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, [minActiveTime, fadeDuration]);

  // Keep body data-page in sync with route for any legacy CSS hooks
  useEffect(() => {
    const pageName = isHome
      ? 'home'
      : location.pathname.replace(/^\/(pages\/)?/, '').replace(/\.html$/, '') || 'home';
    document.body.dataset.page = pageName;
  }, [location.pathname, isHome]);

  if (status === 'hidden') return null;

  const bikeImgUrl = '/assets/images/ryvon-superbike.png';

  return (
    <div
      id="ryvon-loader"
      className={`ryvon-loader ${isHome ? 'is-home' : 'is-subpage'} ${status === 'fading' ? 'fade-out' : ''}`}
      style={{
        transition: `opacity ${fadeDuration / 1000}s ease-in-out, visibility ${fadeDuration / 1000}s ease-in-out`
      }}
      aria-live="polite"
      aria-label="Loading RYVON"
    >
      <div className="ryvon-loader-content">
        <div className="ryvon-loader-bike-wrap">
          <img src={bikeImgUrl} className="ryvon-loader-bike-trail trail-3" alt="" aria-hidden="true" />
          <img src={bikeImgUrl} className="ryvon-loader-bike-trail trail-2" alt="" aria-hidden="true" />
          <img src={bikeImgUrl} className="ryvon-loader-bike-trail trail-1" alt="" aria-hidden="true" />
          <img src={bikeImgUrl} className="ryvon-loader-bike" alt="RYVON Superbike" />
          <div className="ryvon-loader-streaks">
            <span className="ryvon-streak streak-1"></span>
            <span className="ryvon-streak streak-2"></span>
            <span className="ryvon-streak streak-3"></span>
          </div>
          <div className="ryvon-loader-shadow"></div>
        </div>
        <div className="ryvon-loader-glow-container">
          <div className="ryvon-loader-glow-beam"></div>
        </div>
        {isHome ? (
          <>
            <h1 className="ryvon-loader-wordmark">RYVON</h1>
            <p className="ryvon-loader-sublabel">{labelText}</p>
          </>
        ) : (
          <p className="ryvon-loader-sublabel is-subpage">{labelText}</p>
        )}
      </div>
    </div>
  );
}
