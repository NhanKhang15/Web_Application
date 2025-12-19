// src/components/LoadingFallback.jsx
import React from "react";

/**
 * Loading fallback component for React.lazy() Suspense
 * Displays a centered spinner with subtle animation
 */
export default function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                </div>

                {/* Loading text */}
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}
