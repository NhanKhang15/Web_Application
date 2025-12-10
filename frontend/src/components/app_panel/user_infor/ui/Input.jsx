import React from "react";

export function Input({ className = "", type = "text", ...props }) {
  return (
    <input
      type={type}
      className={`h-[50px] w-full rounded-[20px] border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-4 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-white/30 ${className}`}
      {...props}
    />
  );
}
