import React from "react";

export function Dialog({ open, onClose, children }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose} // click outside closes dialog
        >
            <div
                className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative"
                onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
            >
                {children}
            </div>
        </div>
    );
}

export function DialogHeader({ children }) {
    return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
    return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function DialogContent({ children }) {
    return <div className="text-sm text-gray-700">{children}</div>;
}
