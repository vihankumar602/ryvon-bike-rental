export const currencyRates = {
  INR: { symbol: '₹', rate: 1 },
  USD: { symbol: '$', rate: 0.012 },
  EUR: { symbol: '€', rate: 0.011 },
  GBP: { symbol: '£', rate: 0.0094 }
};

export const money = (num, currency = 'INR') => {
  const curr = currencyRates[currency] || currencyRates.INR;
  const converted = Math.round(Number(num) * curr.rate);
  return `${curr.symbol}${converted.toLocaleString()}`;
};
