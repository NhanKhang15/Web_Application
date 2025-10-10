import React from "react";
import { X } from "lucide-react";

// Backdrop + Modal container
export function Dialog({ open, onOpenChange, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal wrapper */}
            <div
                className="
          relative w-full max-w-lg mx-auto p-6
          bg-white dark:bg-neutral-900
          text-neutral-900 dark:text-neutral-100
          rounded-xl shadow-2xl
          border border-neutral-200 dark:border-neutral-800
          transition-all duration-300
        "
            >
                {/* Close button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-3 right-3 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                    <X size={20} />
                </button>

                {children}
            </div>
        </div>
    );
}

// Content
export function DialogContent({ children, className = "" }) {
    return <div className={`space-y-4 ${className}`}>{children}</div>;
}

// Header
export function DialogHeader({ children }) {
    return (
        <div className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            {children}
        </div>
    );
}

export function DialogTitle({ children }) {
    return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function DialogDescription({ children }) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">{children}</p>;
}

// Footer
export function DialogFooter({ children }) {
    return (
        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            {children}
        </div>
    );
}
