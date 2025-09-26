import React from "react";

export default function Avatar({ src, alt, size = 48, className = "" }) {

  const style = className ? undefined : { width: size, height: size };

  return (
    <div
      className={`rounded-full overflow-hidden ${className}`}
      style={style}
    >
      <img
        className="w-full h-full object-cover"
        src={src}
        alt={alt || "avatar"}
        sizes="(max-width: 640px) 40px, (max-width: 1024px) 48px, 60px"
      />
    </div>
  );
}
