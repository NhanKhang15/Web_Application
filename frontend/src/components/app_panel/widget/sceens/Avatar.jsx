import React, { useState } from "react";

export default function Avatar({ src, alt = "User", size = 48, className = "" }) {
    const [imgError, setImgError] = useState(false);
    const initials = alt ? alt.charAt(0).toUpperCase() : "?";
    const style = className ? undefined : { width: size, height: size };

    return (
        <div
            className={`flex items-center justify-center rounded-full 
                  bg-gray-300 dark:bg-neutral-700 
                  text-white dark:text-gray-200 
                  border-2 border-gray-200 dark:border-neutral-600
                  font-semibold overflow-hidden 
                  transition-colors duration-300 ${className}`}
            style={style}
        >
            {!imgError && src ? (
                <img
                    className="w-full h-full object-cover"
                    src={src}
                    alt={alt}
                    onError={() => setImgError(true)}
                />
            ) : (
                <span style={{ fontSize: size * 0.4 }}>{initials}</span>
            )}
        </div>
    );
}
