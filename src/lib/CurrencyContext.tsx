import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = "USD" | "EUR" | "GBP" | "CZK" | "UAH" | "PLN" | "CAD" | "AUD" | "JPY" | "CHF";

export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "CZK", "UAH", "PLN", "CAD", "AUD", "JPY", "CHF"];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CZK: "Kč", UAH: "₴", PLN: "zł", CAD: "C$", AUD: "A$", JPY: "¥", CHF: "CHF"
};

interface CurrencyContextType {
  rates: Record<string, number>;
  baseCurrency: Currency;
  setBaseCurrency: (c: Currency) => void;
  displayCurrency: Currency;
  setDisplayCurrency: (c: Currency) => void;
  convert: (amount: number, from?: string, to?: string) => number;
  format: (amount: number, currency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({ children, user }: { children: React.ReactNode, user: string | null }) => {
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [baseCurrency, setBaseCurrencyState] = useState<Currency>("USD");
  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    if (user) {
      const savedBase = localStorage.getItem(`kraft_base_currency_${user}`) as Currency;
      if (savedBase && CURRENCIES.includes(savedBase)) setBaseCurrencyState(savedBase);
      
      const savedDisplay = localStorage.getItem(`kraft_display_currency_${user}`) as Currency;
      if (savedDisplay && CURRENCIES.includes(savedDisplay)) setDisplayCurrencyState(savedDisplay);
    }
  }, [user]);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates(data.rates);
        }
      })
      .catch(err => console.error("Failed to fetch rates", err));
  }, []);

  const setBaseCurrency = (c: Currency) => {
    setBaseCurrencyState(c);
    if (user) localStorage.setItem(`kraft_base_currency_${user}`, c);
  };

  const setDisplayCurrency = (c: Currency) => {
    setDisplayCurrencyState(c);
    if (user) localStorage.setItem(`kraft_display_currency_${user}`, c);
  };

  const convert = (amount: number, from: string = baseCurrency, to: string = displayCurrency) => {
    if (from === to) return amount;
    const rateFrom = rates[from] || 1;
    const rateTo = rates[to] || 1;
    return (amount / rateFrom) * rateTo;
  };

  const format = (amount: number, currency: string = displayCurrency) => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ rates, baseCurrency, setBaseCurrency, displayCurrency, setDisplayCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
