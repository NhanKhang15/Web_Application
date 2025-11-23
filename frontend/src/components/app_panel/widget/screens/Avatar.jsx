// src/widget/screens/Avatar.jsx
import React, { useState } from "react";

export default function Avatar({ src, alt = "User", size = 48, className = "" }) {
    const [imgError, setImgError] = useState(false);
    // Lấy chữ cái đầu, viết hoa
    const initials = alt ? alt.substring(0, 1).toUpperCase() : "?";

    return (
        <div
            className={`flex items-center justify-center rounded-full 
                  bg-neutral-200 dark:bg-neutral-700 
                  text-neutral-600 dark:text-neutral-200 
                  border-2 border-white dark:border-neutral-600 shadow-sm
                  font-bold overflow-hidden shrink-0 
                  ${className}`}
            style={{
                width: size,
                height: size,
                minWidth: size,
                minHeight: size,
                // 👇 Quan trọng: Tính cỡ chữ theo kích thước khung
                fontSize: Math.max(14, size * 0.45)
            }}
        >
            {!imgError && src ? (
                <img
                    className="w-full h-full object-cover"
                    src={src}
                    alt={alt}
                    onError={() => setImgError(true)}
                />
            ) : (
                <span className="leading-none select-none">{initials}</span>
            )}
        </div>
    );
}