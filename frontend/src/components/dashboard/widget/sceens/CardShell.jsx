import React from "react";
import SubSidebar from "../../slidebar/screens/SubSidebar";

export default function CardShell({
  children,
  subKey,
  onSubChange,
  variant = "sub",
  customLeft = null,
  plClass,
}) {
  const defaultLeftPad = variant === "sub"
    ? "pl-24 md:pl-32 lg:pl-36"
    : "pl-6 md:pl-10 lg:pl-[320px]";
  const leftPad = plClass ?? defaultLeftPad;

  return (
    <div className="relative overflow-hidden bg-white rounded-[15px] shadow-[0_2px_15px_rgba(0,0,0,0.15)] h-full min-h-0 z-50">
      {variant === "sub" ? (
        <SubSidebar active={subKey} onChange={onSubChange} />
      ) : (
        customLeft
      )}
      <div className={`p-4 sm:p-6 lg:p-8 ${leftPad} h-full min-h-0 flex flex-col overflow-auto overflow-x-hidden`}>
        {children}
      </div>
    </div>
  );
}
