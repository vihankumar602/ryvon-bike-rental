import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  let toast = (msg) => {};
  try {
    const toastContext = useToast();
    if (toastContext && toastContext.toast) toast = toastContext.toast;
  } catch (e) {
    // fallback if outside ToastProvider
  }

  const getWishlistKey = () => {
    return user?.email ? `rideos-wishlist-${user.email.toLowerCase()}` : 'rideos-wishlist';
  };

  const getComparisonsKey = () => {
    return user?.email ? `rideos-comparisons-${user.email.toLowerCase()}` : 'rideos-comparisons';
  };

  const [wishes, setWishes] = useState(() => {
    try {
      const key = user?.email ? `rideos-wishlist-${user.email.toLowerCase()}` : 'rideos-wishlist';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  });

  const [comparisons, setComparisons] = useState(() => {
    try {
      const key = user?.email ? `rideos-comparisons-${user.email.toLowerCase()}` : 'rideos-comparisons';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const key = getWishlistKey();
    try {
      setWishes(JSON.parse(localStorage.getItem(key) || '[]'));
    } catch (e) {
      setWishes([]);
    }
    const compKey = getComparisonsKey();
    try {
      setComparisons(JSON.parse(localStorage.getItem(compKey) || '[]'));
    } catch (e) {
      setComparisons([]);
    }
  }, [user]);

  const toggleWish = (id) => {
    const has = wishes.includes(id);
    const next = has ? wishes.filter(x => x !== id) : [...wishes, id];
    setWishes(next);
    localStorage.setItem(getWishlistKey(), JSON.stringify(next));
    toast(has ? 'Removed from shortlist.' : 'Saved for your next escape.');
  };

  const isWished = (id) => wishes.includes(id);

  const toggleCompare = (id, onOpenModal) => {
    const has = comparisons.includes(id);
    if (!has && comparisons.length === 2) {
      toast('Compare up to two vehicles at a time.');
      return;
    }
    const next = has ? comparisons.filter(x => x !== id) : [...comparisons, id];
    setComparisons(next);
    localStorage.setItem(getComparisonsKey(), JSON.stringify(next));
    if (!has && next.length === 1) {
      toast('Select one more vehicle to compare.');
    } else if (!has && next.length === 2 && onOpenModal) {
      onOpenModal(next[0], next[1]);
    }
  };

  const isCompared = (id) => comparisons.includes(id);

  const clearGarage = () => {
    setWishes([]);
    localStorage.setItem(getWishlistKey(), JSON.stringify([]));
    toast('Your private garage vault has been cleared.');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishes,
        wishlist: wishes,
        comparisons,
        toggleWish,
        toggleWishlist: toggleWish,
        isWished,
        isSaved: isWished,
        toggleCompare,
        isCompared,
        clearGarage,
        clearWishlist: clearGarage,
        setComparisons
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
