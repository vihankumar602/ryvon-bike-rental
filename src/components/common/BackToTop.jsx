import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      className="back-top active"
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      style={{ opacity: 1, visibility: 'visible', pointerEvents: 'auto' }}
    >
      ↑
    </button>
  );
}
