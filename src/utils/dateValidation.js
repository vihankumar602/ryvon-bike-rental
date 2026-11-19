/**
 * RYVON Bike Rental - Global Booking Date Validation Utility
 *
 * Rules:
 * 1. Return date must ALWAYS be strictly later than pickup date (minimum 1 day rental).
 * 2. Pickup date cannot be in the past (before today).
 * 3. Empty or malformed dates must be caught and reported with clear inline errors.
 * 4. When pickup date changes, minimum selectable return date is updated automatically.
 * 5. Return date remains fully editable by the user.
 */

export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDays = (dateStr, days) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowDateString = () => {
  return addDays(getTodayDateString(), 1);
};

export const getMinReturnDate = (pickupDateStr) => {
  if (!pickupDateStr) return getTomorrowDateString();
  return addDays(pickupDateStr, 1);
};

export const calculateDurationDays = (pickupDateStr, returnDateStr) => {
  if (!pickupDateStr || !returnDateStr) return 0;
  const pParts = pickupDateStr.split('-').map(Number);
  const rParts = returnDateStr.split('-').map(Number);
  if (pParts.length !== 3 || rParts.length !== 3) return 0;

  const p = new Date(pParts[0], pParts[1] - 1, pParts[2]);
  const r = new Date(rParts[0], rParts[1] - 1, rParts[2]);

  const diffMs = r.getTime() - p.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Validates pickup and return dates according to RYVON strict rental rules.
 *
 * @param {string} pickupDateStr - YYYY-MM-DD
 * @param {string} returnDateStr - YYYY-MM-DD
 * @returns {{ isValid: boolean, error: string | null, days: number }}
 */
export const validateBookingDates = (pickupDateStr, returnDateStr) => {
  const today = getTodayDateString();

  if (!pickupDateStr || !pickupDateStr.trim()) {
    return {
      isValid: false,
      error: 'Please select a pickup date.',
      days: 0
    };
  }

  if (!returnDateStr || !returnDateStr.trim()) {
    return {
      isValid: false,
      error: 'Please select a return date.',
      days: 0
    };
  }

  // Check valid date format YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(pickupDateStr) || !datePattern.test(returnDateStr)) {
    return {
      isValid: false,
      error: 'Please enter valid calendar dates in YYYY-MM-DD format.',
      days: 0
    };
  }

  // Check pickup date is not before today
  if (pickupDateStr < today) {
    return {
      isValid: false,
      error: 'Pickup date cannot be in the past. Please select today or a future date.',
      days: 0
    };
  }

  // Check return date must be strictly after pickup date
  if (returnDateStr <= pickupDateStr) {
    return {
      isValid: false,
      error: 'Return date must be later than pickup date (minimum 1 day rental).',
      days: 0
    };
  }

  const days = calculateDurationDays(pickupDateStr, returnDateStr);

  return {
    isValid: true,
    error: null,
    days
  };
};
