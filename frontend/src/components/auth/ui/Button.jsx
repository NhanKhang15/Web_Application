import React from "react";

// variant: default | destructive | outline | secondary | ghost | link
// size: default | sm | lg | icon
export function Button({ children, variant = "default", size = "default", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-white text-neutral-900 hover:bg-neutral-200 focus-visible:ring-white/40",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
    outline: "border border-white/20 bg-transparent hover:bg-white/10",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
    ghost: "hover:bg-white/10",
    link: "text-blue-400 underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-9 px-4",
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-8",
    icon: "h-9 w-9",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
