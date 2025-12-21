import React from 'react';
import { useCurrency } from './CurrencyContext';
import { DollarSign } from 'lucide-react';

/**
 * Currency Selector Component
 * Dropdown to select user's preferred display currency
 */
export default function CurrencySelector({ className = '' }) {
    const { currency, currencies, changeCurrency, loading } = useCurrency();

    if (loading) {
        return (
            <div className={`flex items-center gap-1 text-neutral-400 ${className}`}>
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">...</span>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <select
                value={currency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="appearance-none bg-neutral-800 dark:bg-neutral-200 
                         border border-neutral-700 dark:border-neutral-300 
                         rounded-full px-3 py-1.5 pr-7 text-xs font-medium
                         text-neutral-200 dark:text-neutral-800
                         hover:bg-neutral-700 dark:hover:bg-neutral-100
                         focus:outline-none focus:ring-1 focus:ring-[#e43137]
                         cursor-pointer transition-colors"
                title="Select currency"
            >
                {Object.entries(currencies).map(([code, { symbol, name }]) => (
                    <option key={code} value={code} className="bg-neutral-800 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-800">
                        {symbol} {code}
                    </option>
                ))}
            </select>
            <DollarSign className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 dark:text-neutral-600 pointer-events-none" />
        </div>
    );
}
