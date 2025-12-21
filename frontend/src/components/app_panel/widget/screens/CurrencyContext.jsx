import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getJSON } from '../../../../lib/api_url';

const CurrencyContext = createContext();

// Supported currencies with symbols
const CURRENCIES = {
    VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    KRW: { code: 'KRW', symbol: '₩', name: 'Korean Won' },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    THB: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
};

const STORAGE_KEY = 'user_preferred_currency';

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        // Load from localStorage or default to VND
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved && CURRENCIES[saved] ? saved : 'VND';
    });

    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch exchange rates from backend
    const fetchRates = useCallback(async () => {
        try {
            const response = await getJSON('/api/currency/rates');
            if (response?.rates) {
                setRates(response.rates);
            }
        } catch (error) {
            console.warn('Failed to fetch currency rates, using fallback:', error);
            // Fallback rates
            setRates({
                VND: 1,
                USD: 0.00004,
                EUR: 0.000037,
                GBP: 0.000032,
                JPY: 0.006,
                KRW: 0.055,
                CNY: 0.00029,
                THB: 0.0014,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();
        // Refresh rates every 6 hours
        const interval = setInterval(fetchRates, 6 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchRates]);

    // Save currency preference to localStorage
    const changeCurrency = useCallback((newCurrency) => {
        if (CURRENCIES[newCurrency]) {
            setCurrency(newCurrency);
            localStorage.setItem(STORAGE_KEY, newCurrency);
        }
    }, []);

    // Convert VND amount to current currency
    const convert = useCallback((amountVND) => {
        if (!amountVND || currency === 'VND') return amountVND;
        const rate = rates[currency];
        if (!rate) return amountVND;
        return Math.round(amountVND * rate * 100) / 100;
    }, [currency, rates]);

    // Format price with symbol (VND only)
    const formatVND = useCallback((amount) => {
        if (amount == null) return '₫0';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(amount);
    }, []);

    // Format converted price with symbol
    const formatConverted = useCallback((amountVND) => {
        if (currency === 'VND') return null; // No conversion needed
        const converted = convert(amountVND);
        const { symbol } = CURRENCIES[currency];

        // Format based on currency
        if (currency === 'JPY' || currency === 'KRW') {
            return `${symbol}${Math.round(converted).toLocaleString()} `;
        }
        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `;
    }, [currency, convert]);

    // Get both VND and converted price display
    const formatPrice = useCallback((amountVND, options = {}) => {
        const { showApprox = true } = options;
        const vndPrice = formatVND(amountVND);

        if (currency === 'VND') {
            return { primary: vndPrice, secondary: null };
        }

        const convertedPrice = formatConverted(amountVND);
        return {
            primary: vndPrice,
            secondary: showApprox ? `≈ ${convertedPrice} ${currency} ` : convertedPrice,
        };
    }, [currency, formatVND, formatConverted]);

    const value = {
        currency,
        currencies: CURRENCIES,
        rates,
        loading,
        changeCurrency,
        convert,
        formatVND,
        formatConverted,
        formatPrice,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export default CurrencyContext;
