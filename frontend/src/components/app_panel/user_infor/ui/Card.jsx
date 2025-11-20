import React from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-neutral-900/60 text-neutral-100 shadow ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ children, className = "", ...props }) {
  return <div className={`font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</div>;
}

export function CardDescription({ children, className = "", ...props }) {
  return <div className={`text-sm text-neutral-400 ${className}`} {...props}>{children}</div>;
}

export function CardContent({ children, className = "", ...props }) {
  return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;
}

export function CardFooter({ children, className = "", ...props }) {
  return <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>{children}</div>;
}
