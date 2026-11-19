import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyRates, money as formatMoney } from '../utils/currency';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('ryvon-currency') || 'INR';
  });

  useEffect(() => {
    localStorage.setItem('ryvon-currency', currency);
  }, [currency]);

  const setCurrency = (c) => {
    setCurrencyState(c);
  };

  const money = (num) => {
    return formatMoney(num, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, money, currencyRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'INR',
      setCurrency: () => {},
      money: (num) => formatMoney(num, 'INR'),
      currencyRates
    };
  }
  return context;
}
